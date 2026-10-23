import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { JWT_SECRET, type AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email, and password are required.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for duplicate email
    const existing = await db.users.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    // Hash password with bcryptjs
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Enforce role-based security: public registration is ALWAYS 'patient'
    const newUser = await db.users.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'patient',
      accountStatus: 'active',
      phone: phone ? phone.trim() : '',
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Audit log
    await logAuditEvent({
      actorId: newUser._id,
      actorEmail: newUser.email,
      actorRole: 'patient',
      action: 'USER_REGISTER',
      resourceType: 'AUTH',
      resourceId: newUser._id,
      details: `New patient registered: ${newUser.name} (${newUser.email})`,
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        accountStatus: newUser.accountStatus,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred during registration. Please try again.',
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Both email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.users.findOne({ email: normalizedEmail });

    if (!user) {
      await logAuditEvent({
        actorId: 'anonymous',
        actorEmail: normalizedEmail,
        actorRole: 'system',
        action: 'LOGIN_FAILURE_NOT_FOUND',
        resourceType: 'AUTH',
        details: `Failed login attempt for nonexistent email: ${normalizedEmail}`,
        req,
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    if (user.accountStatus === 'deactivated') {
      return res.status(403).json({
        success: false,
        error: 'This account has been deactivated. Please contact an administrator.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await logAuditEvent({
        actorId: user._id,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'LOGIN_FAILURE_PASSWORD',
        resourceType: 'AUTH',
        resourceId: user._id,
        details: `Failed password verification for user ${user.email}`,
        req,
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAuditEvent({
      actorId: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'LOGIN_SUCCESS',
      resourceType: 'AUTH',
      resourceId: user._id,
      details: `User ${user.email} (${user.role}) logged in successfully.`,
      req,
    });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred during login. Please try again.',
    });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const user = await db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // If user is a doctor, also fetch associated doctor profile
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await db.doctors.findByUserId(user._id);
      if (!doctorProfile) {
        doctorProfile = await db.doctors.findOne({ email: user.email });
      }
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt,
        doctorProfile,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve profile.' });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const { name, phone } = req.body;
    const updates: any = {};
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();

    const updated = await db.users.updateById(req.user.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    await logAuditEvent({
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'PROFILE_UPDATED',
      resourceType: 'USER',
      resourceId: req.user.id,
      details: `User updated personal profile details.`,
      req,
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
        accountStatus: updated.accountStatus,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
}
