import React, { useState, useEffect } from 'react';
import type { MedicalRecord, Prescription } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { QRVerificationModal } from '../components/QRVerificationModal.tsx';
import {
  FileText,
  Activity,
  Pill,
  QrCode,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  HeartPulse,
  Thermometer,
  Scale,
} from 'lucide-react';

interface MedicalRecordsPageProps {
  openAuthModal: () => void;
}

export const MedicalRecordsPage: React.FC<MedicalRecordsPageProps> = ({ openAuthModal }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected record for QR verification modal
  const [selectedRecordForQR, setSelectedRecordForQR] = useState<MedicalRecord | null>(null);

  const fetchRecordsAndPrescriptions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const [recordsRes, rxRes] = await Promise.all([
        api.medicalRecords.getAll(),
        api.prescriptions.getAll(),
      ]);

      if (recordsRes.success && recordsRes.records) {
        setRecords(recordsRes.records);
      }

      if (rxRes.success && rxRes.prescriptions) {
        setPrescriptions(rxRes.prescriptions);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve clinical medical records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecordsAndPrescriptions();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Protected Clinical Records</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
          Medical history, clinical diagnoses, and prescriptions are strictly protected by role-based
          access policies. Please log in to view your records.
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

  // Find linked prescription for a record
  const getPrescriptionForRecord = (record: MedicalRecord) => {
    return prescriptions.find(
      (p) => p.recordId === record._id || p.prescriptionId === record.prescriptionId
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Tamper-Evident Medical History</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Medical Records & Prescriptions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access authorized clinical visit summaries, vitals, prescriptions, and digital QR verification.
          </p>
        </div>

        <button
          onClick={fetchRecordsAndPrescriptions}
          className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          title="Refresh medical records"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Records List */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Clinical Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no documented clinical consultation records for this account. Records
            are authored by your attending physician upon consultation completion.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {records.map((record) => {
            const rx = getPrescriptionForRecord(record);

            return (
              <div
                key={record._id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Header Strip */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                      {record.recordId}
                    </span>
                    <div>
                      <span className="text-xs text-slate-400">Visit Date: </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {record.visitDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedRecordForQR(record)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-blue-600" />
                      <span>Verify QR Integrity</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Physician & Patient Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400">Treating Physician:</span>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {record.doctorName}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Patient:</span>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {record.patientName}
                      </div>
                    </div>
                  </div>

                  {/* Vitals Summary */}
                  {record.vitals && Object.values(record.vitals).some((v) => Boolean(v)) && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="text-xs font-bold text-slate-700 mb-3 flex items-center space-x-1.5">
                        <Activity className="w-4 h-4 text-rose-500" />
                        <span>Recorded Vitals</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        {record.vitals.bloodPressure && (
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                              <HeartPulse className="w-3 h-3 text-rose-500" />
                              <span>Blood Pressure</span>
                            </span>
                            <div className="font-bold text-slate-900 mt-1">
                              {record.vitals.bloodPressure}
                            </div>
                          </div>
                        )}
                        {record.vitals.pulseRate && (
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                              <Activity className="w-3 h-3 text-teal-600" />
                              <span>Pulse Rate</span>
                            </span>
                            <div className="font-bold text-slate-900 mt-1">
                              {record.vitals.pulseRate}
                            </div>
                          </div>
                        )}
                        {record.vitals.temperature && (
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                              <Thermometer className="w-3 h-3 text-amber-500" />
                              <span>Body Temp</span>
                            </span>
                            <div className="font-bold text-slate-900 mt-1">
                              {record.vitals.temperature}
                            </div>
                          </div>
                        )}
                        {record.vitals.weightKg && (
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                              <Scale className="w-3 h-3 text-blue-500" />
                              <span>Weight</span>
                            </span>
                            <div className="font-bold text-slate-900 mt-1">
                              {record.vitals.weightKg}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Diagnosis & Treatment Notes */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span>Clinical Diagnosis</span>
                      </h4>
                      <p className="text-slate-700 bg-blue-50/40 p-3.5 rounded-xl border border-blue-100 leading-relaxed font-medium">
                        {record.diagnosis}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                        <span>Physician Treatment Notes & Clinical Guidance</span>
                      </h4>
                      <p className="text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                        {record.treatmentNotes}
                      </p>
                    </div>
                  </div>

                  {/* Linked Prescription Section */}
                  {rx && rx.medications && rx.medications.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                          <Pill className="w-4 h-4 text-emerald-600" />
                          <span>Prescription ({rx.prescriptionId})</span>
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Issued: {rx.prescriptionDate}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {rx.medications.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-950 text-xs">
                                {item.medicationName}
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                {item.duration}
                              </span>
                            </div>
                            <div className="text-slate-600 text-[11px]">
                              Dosage: <strong className="text-slate-800">{item.dosage}</strong> •{' '}
                              {item.frequency}
                            </div>
                            {item.instructions && (
                              <div className="text-[11px] text-slate-500 italic pt-1">
                                Note: {item.instructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {rx.instructions && (
                        <div className="mt-3 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <strong className="text-slate-800">Pharmacy Instructions:</strong>{' '}
                          {rx.instructions}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Verification Hash Footer */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
                    <div className="flex items-center space-x-1 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>Tamper Token: {record.verificationHash}</span>
                    </div>
                    <span>Created: {new Date(record.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Verification Modal */}
      {selectedRecordForQR && (
        <QRVerificationModal
          record={selectedRecordForQR}
          onClose={() => setSelectedRecordForQR(null)}
        />
      )}
    </div>
  );
};
