import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Frontend validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Full name is required.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        setSuccessMsg('Authentication verified. Welcome back!');
      } else {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword,
          phone: phone.trim(),
        });
        setSuccessMsg('Account created successfully! Patient session initialized.');
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Helper for quick demonstration
  const handleQuickFill = (testEmail: string, testPass: string) => {
    setMode('login');
    setEmail(testEmail);
    setPassword(testPass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in duration-200 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {mode === 'login' ? 'Sign In to Your Account' : 'Register Patient Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Access your appointments, health records, or doctor portal'
              : 'Create a secure patient profile with encrypted credentials'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Register Patient
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Johnathan Doe"
                  required
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Processing Security Checks...' : mode === 'login' ? 'Sign In' : 'Create Patient Account'}
          </button>
        </form>

        {/* Demo Test Credentials Quick Selector for Reviewers */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-700 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Demonstration Test Accounts (TYCS Evaluator Mode):</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => handleQuickFill('patient@example.com', 'Patient@123456')}
              className="p-2 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/60 text-blue-800 text-left transition-colors"
            >
              <div className="font-bold flex items-center space-x-1">
                <UserIcon className="w-3 h-3 text-blue-600" />
                <span>Patient</span>
              </div>
              <div className="text-slate-500 text-[9px] truncate">patient@example.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('dr.ananya@healthcare.org', 'Doctor@123456')}
              className="p-2 rounded-lg border border-teal-200 bg-teal-50/60 hover:bg-teal-100/60 text-teal-800 text-left transition-colors"
            >
              <div className="font-bold flex items-center space-x-1">
                <Stethoscope className="w-3 h-3 text-teal-600" />
                <span>Doctor</span>
              </div>
              <div className="text-slate-500 text-[9px] truncate">dr.ananya@...</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin@healthcare.org', 'Admin@123456')}
              className="p-2 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100/60 text-purple-800 text-left transition-colors"
            >
              <div className="font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-purple-600" />
                <span>Admin</span>
              </div>
              <div className="text-slate-500 text-[9px] truncate">admin@healthcare.org</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
