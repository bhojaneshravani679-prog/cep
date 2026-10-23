import React, { useState, useEffect } from 'react';
import type { Doctor } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface AppointmentModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onSuccess: (appointment: any) => void;
  openAuthModal: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  doctor,
  onClose,
  onSuccess,
  openAuthModal,
}) => {
  const { user } = useAuth();
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [reasonForVisit, setReasonForVisit] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Set min date to today (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (doctor) {
      // Default to today or tomorrow
      setAppointmentDate(today);
      fetchSlots(doctor._id);
    }
  }, [doctor]);

  const fetchSlots = async (docId: string) => {
    try {
      const res = await api.doctors.getById(docId);
      if (res.availableSlots) {
        setAvailableSlots(res.availableSlots);
        setAppointmentTime(res.availableSlots[0] || '10:00 AM');
      }
    } catch {
      setAvailableSlots(['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']);
      setAppointmentTime('10:00 AM');
    }
  };

  if (!doctor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!user) {
      openAuthModal();
      return;
    }

    if (!appointmentDate) {
      setError('Please select an appointment date.');
      return;
    }

    if (appointmentDate < today) {
      setError('Appointment date cannot be in the past.');
      return;
    }

    if (!appointmentTime) {
      setError('Please select a time slot.');
      return;
    }

    if (!reasonForVisit.trim() || reasonForVisit.trim().length < 5) {
      setError('Please describe your reason for visit (minimum 5 characters).');
      return;
    }

    setLoading(true);
    try {
      const res = await api.appointments.book({
        doctorId: doctor._id,
        appointmentDate,
        appointmentTime,
        reasonForVisit: reasonForVisit.trim(),
      });

      if (res.success) {
        setSuccessMsg(`Appointment booked! Reference ID: ${res.appointment.appointmentId}`);
        setTimeout(() => {
          onSuccess(res.appointment);
          onClose();
        }, 1400);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in duration-200 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            Appointment Booking
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Book Visit with {doctor.name}
          </h2>
          <p className="text-xs text-slate-500">{doctor.specialization} • ${doctor.consultationFee} Fee</p>
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
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {!user && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <div className="flex items-center space-x-2 font-semibold">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>Authentication Required</span>
            </div>
            <p className="mt-1 text-amber-700 leading-relaxed">
              To associate appointments securely with your medical identity and prevent unauthorized bookings, please sign in or register a patient account.
            </p>
            <button
              type="button"
              onClick={openAuthModal}
              className="mt-2.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors cursor-pointer"
            >
              Log In / Register Now
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Patient Details (derived from session) */}
          {user && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500">Booking as: </span>
              <span className="font-semibold text-slate-900">{user.name}</span>
              <span className="text-slate-400"> ({user.email})</span>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Select Date *</span>
            </label>
            <input
              type="date"
              min={today}
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">Past dates are automatically restricted.</p>
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>Available Time Slot *</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setAppointmentTime(slot)}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    appointmentTime === slot
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Reason for Consultation *</span>
            </label>
            <textarea
              rows={3}
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              placeholder="E.g., Routine blood pressure check, fever since 2 days, allergy consultation..."
              required
              minLength={5}
              maxLength={500}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Securing Slot...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
