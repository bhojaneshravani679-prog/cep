import React, { useState, useEffect } from 'react';
import type { Doctor, Appointment } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import {
  Calendar as CalendarIcon,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface BookAppointmentPageProps {
  preselectedDoctor: Doctor | null;
  onNavigate: (tab: string) => void;
  openAuthModal: () => void;
}

export const BookAppointmentPage: React.FC<BookAppointmentPageProps> = ({
  preselectedDoctor,
  onNavigate,
  openAuthModal,
}) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(preselectedDoctor?._id || '');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(preselectedDoctor);
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [reasonForVisit, setReasonForVisit] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingDoctors, setFetchingDoctors] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDoctors();
    setAppointmentDate(today);
  }, []);

  useEffect(() => {
    if (preselectedDoctor) {
      setSelectedDoctorId(preselectedDoctor._id);
      setSelectedDoctor(preselectedDoctor);
      fetchSlots(preselectedDoctor._id);
    }
  }, [preselectedDoctor]);

  const loadDoctors = async () => {
    try {
      setFetchingDoctors(true);
      const res = await api.doctors.getAll();
      if (res.success && res.doctors) {
        setDoctors(res.doctors);
        if (!selectedDoctorId && res.doctors.length > 0) {
          const first = res.doctors[0];
          setSelectedDoctorId(first._id);
          setSelectedDoctor(first);
          fetchSlots(first._id);
        }
      }
    } catch (err: any) {
      setError('Failed to load doctors list.');
    } finally {
      setFetchingDoctors(false);
    }
  };

  const handleDoctorChange = (docId: string) => {
    setSelectedDoctorId(docId);
    const doc = doctors.find((d) => d._id === docId) || null;
    setSelectedDoctor(doc);
    if (doc) {
      fetchSlots(doc._id);
    }
  };

  const fetchSlots = async (docId: string) => {
    try {
      const res = await api.doctors.getById(docId);
      if (res.availableSlots) {
        setAvailableSlots(res.availableSlots);
        setAppointmentTime(res.availableSlots[0] || '10:00 AM');
      }
    } catch {
      const defaultSlots = [
        '09:00 AM',
        '09:30 AM',
        '10:00 AM',
        '10:30 AM',
        '11:00 AM',
        '02:00 PM',
        '02:30 PM',
        '03:00 PM',
        '03:30 PM',
        '04:00 PM',
      ];
      setAvailableSlots(defaultSlots);
      setAppointmentTime('10:00 AM');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreatedAppointment(null);

    if (!user) {
      openAuthModal();
      return;
    }

    if (!selectedDoctorId) {
      setError('Please select a doctor.');
      return;
    }

    if (!appointmentDate) {
      setError('Please select an appointment date.');
      return;
    }

    if (appointmentDate < today) {
      setError('Appointment date cannot be in the past. Please select today or a future date.');
      return;
    }

    if (!appointmentTime) {
      setError('Please select a time slot.');
      return;
    }

    if (!reasonForVisit.trim() || reasonForVisit.trim().length < 5) {
      setError('Please provide a specific reason for consultation (minimum 5 characters).');
      return;
    }

    setLoading(true);

    try {
      const res = await api.appointments.book({
        doctorId: selectedDoctorId,
        appointmentDate,
        appointmentTime,
        reasonForVisit: reasonForVisit.trim(),
      });

      if (res.success && res.appointment) {
        setCreatedAppointment(res.appointment);
        // Clear form after successful booking
        setReasonForVisit('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <CalendarIcon className="w-4 h-4" />
          <span>Interactive Scheduling Engine</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Book an Appointment</h1>
        <p className="text-sm text-slate-500 mt-1">
          Reserve your consultation with our verified doctors. Real-time availability checks prevent
          double booking.
        </p>
      </div>

      {/* Success Banner if Booked */}
      {createdAppointment && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-950">
                Appointment Successfully Booked!
              </h2>
              <p className="text-xs text-emerald-800">
                Your appointment ID is{' '}
                <span className="font-mono font-bold">{createdAppointment.appointmentId}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-emerald-100 text-xs">
            <div>
              <span className="text-slate-400">Doctor:</span>
              <p className="font-semibold text-slate-900">{createdAppointment.doctorName}</p>
            </div>
            <div>
              <span className="text-slate-400">Date:</span>
              <p className="font-semibold text-slate-900">{createdAppointment.appointmentDate}</p>
            </div>
            <div>
              <span className="text-slate-400">Time:</span>
              <p className="font-semibold text-slate-900">{createdAppointment.appointmentTime}</p>
            </div>
            <div>
              <span className="text-slate-400">Status:</span>
              <p className="font-bold text-amber-600">{createdAppointment.status}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => onNavigate('appointments')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <span>View in My Appointments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCreatedAppointment(null)}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-emerald-900 bg-emerald-100 hover:bg-emerald-200 transition-colors cursor-pointer"
            >
              Book Another Visit
            </button>
          </div>
        </div>
      )}

      {/* Booking Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {!user && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-3">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Patient Login Required Before Booking</span>
              <p className="mt-0.5 text-amber-700">
                To guarantee tamper-proof medical records and prevent impersonation, bookings must be
                authenticated.
              </p>
              <button
                type="button"
                onClick={openAuthModal}
                className="mt-2 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors cursor-pointer"
              >
                Sign In / Register Now
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Doctor */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span>Step 1: Select Medical Doctor *</span>
            </label>

            {fetchingDoctors ? (
              <div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
            ) : (
              <select
                value={selectedDoctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} — {doc.specialization} (${doc.consultationFee}) {doc.isSample ? '[Sample]' : ''}
                  </option>
                ))}
              </select>
            )}

            {selectedDoctor && (
              <div className="mt-3 p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between text-xs text-blue-950">
                <div>
                  <span className="font-bold">{selectedDoctor.name}</span>
                  <span className="text-slate-500"> ({selectedDoctor.qualifications})</span>
                </div>
                <div className="font-semibold text-blue-800">
                  Fee: ${selectedDoctor.consultationFee}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Select Date */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <span>Step 2: Choose Appointment Date *</span>
            </label>
            <input
              type="date"
              min={today}
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum date restriction is strictly enforced on the server.
            </p>
          </div>

          {/* Step 3: Choose Time Slot */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Step 3: Available Time Slot *</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {availableSlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setAppointmentTime(slot)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                    appointmentTime === slot
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Reason for Visit */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Step 4: Clinical Reason for Consultation *</span>
            </label>
            <textarea
              rows={4}
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              placeholder="Describe your primary symptoms, duration, or reason for this consultation (e.g. chronic headache for 3 days, routine cardiology checkup)..."
              required
              minLength={5}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Minimum 5 characters required</span>
              <span>{reasonForVisit.length} / 500 characters</span>
            </div>
          </div>

          {/* Authenticated Patient Notice */}
          {user && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span className="text-slate-700">
                  Appointment will be linked to: <strong className="text-slate-900">{user.name}</strong> ({user.email})
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Authenticated via JWT</span>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Securing Server Slot...' : 'Confirm & Schedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
