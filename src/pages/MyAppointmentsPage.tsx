import React, { useState, useEffect } from 'react';
import type { Appointment } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  AlertCircle,
  RefreshCw,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
} from 'lucide-react';

interface MyAppointmentsPageProps {
  onNavigate: (tab: string) => void;
  openAuthModal: () => void;
}

export const MyAppointmentsPage: React.FC<MyAppointmentsPageProps> = ({
  onNavigate,
  openAuthModal,
}) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Cancellation modal state
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchAppointments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.appointments.getAll({
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });

      if (res.success && res.appointments) {
        setAppointments(res.appointments);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve appointments list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [user, statusFilter]);

  const handleCancelAppointment = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError(null);

    try {
      const res = await api.appointments.cancel(
        cancelTarget._id,
        cancelReason.trim() || 'Patient requested cancellation'
      );

      if (res.success) {
        setToastMessage(`Appointment ${cancelTarget.appointmentId} has been cancelled.`);
        setCancelTarget(null);
        setCancelReason('');
        fetchAppointments();
      }
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Confirmed</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Completed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Sign In to View Appointments</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
          Appointments are confidential and bound to your encrypted user account. Please log in to view
          scheduled consultations.
        </p>
        <button
          onClick={openAuthModal}
          className="mt-6 px-6 py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Patient Consultation Portal</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track consultation status, doctor assignments, and scheduled visit times.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAppointments}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Refresh appointments"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => onNavigate('book')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-xs font-medium">
        {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              statusFilter === tab
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Appointment Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-2xl bg-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Appointments Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter === 'All'
              ? 'You have not scheduled any doctor consultations yet.'
              : `No appointments with status "${statusFilter}".`}
          </p>
          <button
            onClick={() => onNavigate('book')}
            className="mt-3 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer inline-flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book Your First Appointment</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
                    {apt.appointmentId}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Booked: </span>
                    <span className="text-xs text-slate-600 font-medium">
                      {new Date(apt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {getStatusBadge(apt.status)}
                </div>
              </div>

              {/* Main Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium flex items-center space-x-1 mb-1">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    <span>Specialist Doctor:</span>
                  </span>
                  <div className="font-bold text-slate-900 text-sm">{apt.doctorName}</div>
                  <div className="text-slate-500 text-[11px]">{apt.doctorSpecialization}</div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium flex items-center space-x-1 mb-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Date & Time Slot:</span>
                  </span>
                  <div className="font-bold text-slate-900 text-sm">
                    {apt.appointmentDate}
                  </div>
                  <div className="text-slate-500 text-[11px]">{apt.appointmentTime}</div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium flex items-center space-x-1 mb-1">
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>Clinical Reason:</span>
                  </span>
                  <p className="text-slate-700 leading-relaxed line-clamp-2">
                    {apt.reasonForVisit}
                  </p>
                </div>
              </div>

              {/* Cancellation Reason if present */}
              {apt.status === 'Cancelled' && apt.cancellationReason && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-[11px] text-rose-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Cancellation Reason: </span>
                    <span>{apt.cancellationReason}</span>
                    {apt.cancelledBy && (
                      <span className="text-rose-500 ml-1">({apt.cancelledBy})</span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Patient: {apt.patientName}</span>
                </div>

                {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                  <button
                    onClick={() => {
                      setCancelTarget(apt);
                      setCancelReason('');
                      setCancelError(null);
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Cancel Appointment?</h3>
            <p className="text-xs text-slate-500 mt-1">
              You are about to cancel appointment{' '}
              <strong className="text-slate-700">{cancelTarget.appointmentId}</strong> with{' '}
              <strong>{cancelTarget.doctorName}</strong> on {cancelTarget.appointmentDate}.
            </p>

            {cancelError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {cancelError}
              </div>
            )}

            <div className="mt-4 text-xs">
              <label className="block font-semibold text-slate-700 mb-1">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="E.g., Scheduling conflict, recovered from symptoms..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelAppointment}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {cancelling ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
