import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
} from '../controllers/authController.js';
import {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  updateDoctorVerification,
} from '../controllers/doctorController.js';
import {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  verifyRecordByQR,
} from '../controllers/medicalRecordController.js';
import {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
} from '../controllers/prescriptionController.js';
import {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  getAuditLogs,
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { getDbStatus } from '../config/db.js';

const api = Router();

// System Health
api.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ONLINE',
    service: 'Secure Healthcare System API',
    timestamp: new Date().toISOString(),
    database: getDbStatus(),
  });
});

// Authentication Routes
api.post('/auth/register', register);
api.post('/auth/login', login);
api.get('/auth/me', authenticateToken, getMe);
api.patch('/auth/profile', authenticateToken, updateProfile);

// Doctor Routes
api.get('/doctors', getAllDoctors);
api.get('/doctors/:id', getDoctorById);
api.post('/doctors', authenticateToken, requireRole('admin'), createDoctor);
api.patch('/doctors/:id', authenticateToken, requireRole('admin'), updateDoctor);
api.patch('/doctors/:id/verification', authenticateToken, requireRole('admin'), updateDoctorVerification);

// Appointment Routes
api.post('/appointments', authenticateToken, bookAppointment);
api.get('/appointments', authenticateToken, getAppointments);
api.get('/appointments/:id', authenticateToken, getAppointmentById);
api.patch('/appointments/:id/status', authenticateToken, requireRole('doctor', 'admin'), updateAppointmentStatus);
api.post('/appointments/:id/cancel', authenticateToken, cancelAppointment);

// Medical Records Routes
api.get('/medical-records', authenticateToken, getMedicalRecords);
api.get('/medical-records/verify/:hash', verifyRecordByQR); // Public privacy-preserving verification
api.get('/medical-records/:id', authenticateToken, getMedicalRecordById);
api.post('/medical-records', authenticateToken, requireRole('doctor', 'admin'), createMedicalRecord);

// Prescriptions Routes
api.get('/prescriptions', authenticateToken, getPrescriptions);
api.get('/prescriptions/:id', authenticateToken, getPrescriptionById);
api.post('/prescriptions', authenticateToken, requireRole('doctor', 'admin'), createPrescription);

// Administrator Routes
api.get('/admin/stats', authenticateToken, requireRole('admin'), getAdminStats);
api.get('/admin/users', authenticateToken, requireRole('admin'), getAllUsers);
api.patch('/admin/users/:id/status', authenticateToken, requireRole('admin'), toggleUserStatus);
api.get('/admin/audit-logs', authenticateToken, requireRole('admin'), getAuditLogs);

export default api;
