import React, { useState, useEffect } from 'react';
import type { Appointment, MedicalRecord, User } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Stethoscope,
  Calendar,
  FilePlus,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Pill,
  Activity,
  Plus,
  Trash2,
} from 'lucide-react';

export const DoctorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Status updating
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // New Clinical Record Modal / Drawer State
  const [isCreatingRecord, setIsCreatingRecord] = useState<boolean>(false);
  const [recordPatientId, setRecordPatientId] = useState<string>('');
  const [recordAppointmentId, setRecordAppointmentId] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [treatmentNotes, setTreatmentNotes] = useState<string>('');
  const [vitals, setVitals] = useState({
    bloodPressure: '120/80 mmHg',
    pulseRate: '72 bpm',
    temperature: '98.6 F',
    weightKg: '70 kg',
  });

  // Medications in prescription
  const [medications, setMedications] = useState([
    {
      medicationName: '',
      dosage: '1 tablet',
      frequency: 'Twice daily after meals',
      duration: '5 days',
      instructions: 'Take with full glass of water',
    },
  ]);
  const [rxInstructions, setRxInstructions] = useState<string>('');
  const [submittingRecord, setSubmittingRecord] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [aptRes, recRes] = await Promise.all([
        api.appointments.getAll(),
        api.medicalRecords.getAll(),
      ]);

      if (aptRes.success && aptRes.appointments) {
        setAppointments(aptRes.appointments);
      }
      if (recRes.success && recRes.records) {
        setRecords(recRes.records);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      setUpdatingId(appointmentId);
      setError(null);
      const res = await api.appointments.updateStatus(appointmentId, newStatus);
      if (res.success) {
        setSuccessMsg(`Appointment status updated to ${newStatus}.`);
        fetchData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update appointment status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenRecordForAppointment = (apt: Appointment) => {
    setRecordPatientId(apt.patientId);
    setRecordAppointmentId(apt._id);
    setDiagnosis(`Clinical consultation regarding: ${apt.reasonForVisit}`);
    setIsCreatingRecord(true);
  };

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      {
        medicationName: '',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '7 days',
        instructions: 'Take after meals',
      },
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index: number, field: string, val: string) => {
    const updated = [...medications];
    (updated[index] as any)[field] = val;
    setMedications(updated);
  };

  const handleSaveMedicalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!recordPatientId) {
      setError('Patient reference is required.');
      return;
    }
    if (!diagnosis.trim() || !treatmentNotes.trim()) {
      setError('Diagnosis and treatment notes are required.');
      return;
    }

    setSubmittingRecord(true);
    try {
      const validMeds = medications.filter((m) => m.medicationName.trim().length > 0);

      const res = await api.medicalRecords.create({
        patientId: recordPatientId,
        appointmentId: recordAppointmentId || undefined,
        visitDate: new Date().toISOString().split('T')[0],
        diagnosis: diagnosis.trim(),
        treatmentNotes: treatmentNotes.trim(),
        vitals,
        medications: validMeds.length > 0 ? validMeds : undefined,
        prescriptionInstructions: rxInstructions.trim() || undefined,
      });

      if (res.success) {
        setSuccessMsg(`Medical record ${res.record.recordId} and prescription created successfully!`);
        setIsCreatingRecord(false);
        setDiagnosis('');
        setTreatmentNotes('');
        setMedications([
          {
            medicationName: '',
            dosage: '1 tablet',
            frequency: 'Twice daily',
            duration: '5 days',
            instructions: '',
          },
        ]);
        fetchData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create medical record.');
    } finally {
      setSubmittingRecord(false);
    }
  };

  if (!user || (user.role !== 'doctor' && user.role !== 'admin')) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Restricted Medical Portal</h2>
        <p className="text-xs text-slate-500 mt-2">
          Only authorized healthcare practitioners and medical directors can access this clinical portal.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <Stethoscope className="w-4 h-4" />
            <span>Physician Clinical Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage assigned patient consultations, update visit statuses, and issue cryptographic
            medical records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsCreatingRecord(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Create Medical Record</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-medium">Assigned Consultations</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{appointments.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-medium">Pending Appointments</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {appointments.filter((a) => a.status === 'Pending').length}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-medium">Confirmed Visits</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {appointments.filter((a) => a.status === 'Confirmed').length}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-medium">Clinical Records Authored</span>
          <div className="text-2xl font-bold text-teal-600 mt-1">{records.length}</div>
        </div>
      </div>

      {/* Assigned Appointments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Assigned Patient Appointments</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {appointments.length} Appointments
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No patient appointments currently assigned to your practice schedule.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">ID & Date</th>
                  <th className="py-3 px-6">Patient Details</th>
                  <th className="py-3 px-6">Reason for Visit</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Clinical Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-medium">
                      <div className="font-mono text-blue-700 font-bold">{apt.appointmentId}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {apt.appointmentDate} • {apt.appointmentTime}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{apt.patientName}</div>
                      <div className="text-slate-400 text-[11px]">{apt.patientEmail}</div>
                    </td>

                    <td className="py-4 px-6 max-w-xs">
                      <p className="line-clamp-2 text-slate-600">{apt.reasonForVisit}</p>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          apt.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : apt.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : apt.status === 'Completed'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right space-x-1.5">
                      {apt.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(apt._id, 'Confirmed')}
                          disabled={updatingId === apt._id}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                        >
                          Confirm
                        </button>
                      )}

                      {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                        <>
                          <button
                            onClick={() => handleOpenRecordForAppointment(apt)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200"
                            title="Complete consultation and author record"
                          >
                            Add Record
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(apt._id, 'Completed')}
                            disabled={updatingId === apt._id}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                          >
                            Complete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Creation Modal */}
      {isCreatingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="text-xs font-bold uppercase text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded">
                  Clinical Record Documentation
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Author Medical Record & Prescription
                </h3>
              </div>
              <button
                onClick={() => setIsCreatingRecord(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMedicalRecord} className="space-y-4 text-xs">
              {/* Patient Selection if not preselected */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Reference *</label>
                <input
                  type="text"
                  value={recordPatientId}
                  onChange={(e) => setRecordPatientId(e.target.value)}
                  placeholder="Patient User ID (e.g., usr_pat_01)"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              {/* Vitals row */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                  <span>Clinical Patient Vitals</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">Blood Pressure</label>
                    <input
                      type="text"
                      value={vitals.bloodPressure}
                      onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Pulse Rate</label>
                    <input
                      type="text"
                      value={vitals.pulseRate}
                      onChange={(e) => setVitals({ ...vitals, pulseRate: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Body Temp</label>
                    <input
                      type="text"
                      value={vitals.temperature}
                      onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Weight</label>
                    <input
                      type="text"
                      value={vitals.weightKg}
                      onChange={(e) => setVitals({ ...vitals, weightKg: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="E.g. Acute bacterial pharyngitis, Stage-1 Essential Hypertension"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              {/* Treatment Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Treatment Notes & Medical Advice *
                </label>
                <textarea
                  rows={3}
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  placeholder="Enter detailed physician clinical assessment, advised bed rest, hydration, diet changes, or follow-up timelines..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              {/* Prescription builder */}
              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-emerald-950 flex items-center space-x-1.5">
                    <Pill className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Prescription Items (Rx)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                {medications.map((med, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-xl border border-emerald-100 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-[11px]">
                        Medicine #{idx + 1}
                      </span>
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(idx)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Drug Name (e.g. Amoxicillin 500mg)"
                        value={med.medicationName}
                        onChange={(e) =>
                          handleMedicationChange(idx, 'medicationName', e.target.value)
                        }
                        className="col-span-2 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 1 tab)"
                        value={med.dosage}
                        onChange={(e) => handleMedicationChange(idx, 'dosage', e.target.value)}
                        className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g. 5 days)"
                        value={med.duration}
                        onChange={(e) => handleMedicationChange(idx, 'duration', e.target.value)}
                        className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Frequency (e.g. Twice daily)"
                        value={med.frequency}
                        onChange={(e) => handleMedicationChange(idx, 'frequency', e.target.value)}
                        className="col-span-2 px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Instructions (e.g. After meals)"
                        value={med.instructions}
                        onChange={(e) =>
                          handleMedicationChange(idx, 'instructions', e.target.value)
                        }
                        className="col-span-2 px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Special Pharmacy Instructions
                  </label>
                  <input
                    type="text"
                    value={rxInstructions}
                    onChange={(e) => setRxInstructions(e.target.value)}
                    placeholder="E.g. Take with plenty of fluids, avoid dairy within 2 hours of ingestion"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingRecord(false)}
                  className="px-4 py-2 text-xs rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRecord}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submittingRecord ? 'Cryptographically Signing...' : 'Publish Record & Issue Rx'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
