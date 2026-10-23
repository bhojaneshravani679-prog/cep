import React, { useState, useEffect } from 'react';
import type { MedicalRecord } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  X,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
} from 'lucide-react';

interface QRVerificationModalProps {
  record: MedicalRecord | null;
  onClose: () => void;
}

export const QRVerificationModal: React.FC<QRVerificationModalProps> = ({ record, onClose }) => {
  const [activeTab, setActiveTab] = useState<'view' | 'verify'>('view');
  const [verificationCode, setVerificationCode] = useState<string>(record?.verificationHash || '');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (record?.verificationHash) {
      setVerificationCode(record.verificationHash);
    }
  }, [record]);

  if (!record) return null;

  const handleLiveVerification = async (hashToVerify?: string) => {
    const code = hashToVerify || verificationCode;
    if (!code) {
      setError('Please provide a verification hash.');
      return;
    }

    setLoading(true);
    setError(null);
    setVerifyResult(null);

    try {
      const res = await api.medicalRecords.verifyByQR(code.trim());
      if (res.success && res.verificationData) {
        setVerifyResult(res.verificationData);
        setActiveTab('verify');
      } else {
        setError('Verification failed. Invalid or revoked QR code reference.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Hash does not match any authentic record.');
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

        <div className="flex items-center space-x-2 text-teal-700 text-xs font-semibold mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Privacy-Preserving Verification Engine</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Record Authenticity & QR Verification
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Record ID: <span className="font-semibold text-slate-700">{record.recordId}</span>
        </p>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 mb-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('view')}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              activeTab === 'view'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Digital QR Code
          </button>
          <button
            onClick={() => {
              setActiveTab('verify');
              if (!verifyResult) handleLiveVerification();
            }}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              activeTab === 'verify'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Verification Resolver Test
          </button>
        </div>

        {activeTab === 'view' ? (
          <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-inner">
              {record.qrCodeImage ? (
                <img
                  src={record.qrCodeImage}
                  alt="Medical Record Verification QR Code"
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400">
                  <QrCode className="w-16 h-16" />
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-left text-xs space-y-1.5">
              <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero-Knowledge QR Design Standard</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Notice: In accordance with clinical privacy standards, private diagnoses and full patient
                data are <strong>NEVER</strong> encoded into the QR code image. Only a cryptographic
                opaque reference token is stored:
              </p>
              <div className="p-2 rounded bg-slate-200/70 font-mono text-[11px] text-slate-700 break-all select-all">
                Hash: {record.verificationHash}
              </div>
            </div>

            <button
              onClick={() => handleLiveVerification(record.verificationHash)}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{loading ? 'Resolving Backend...' : 'Test Backend QR Verification Resolver'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Input to test arbitrary code */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Verify Record Hash (Backend Resolver)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter record verification code..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleLiveVerification()}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center space-x-1"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Verify</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {verifyResult && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-800 space-y-2">
                <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Authentic & Validated Record</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200 text-[11px]">
                  <div>
                    <span className="text-slate-500">Record ID:</span>
                    <p className="font-semibold text-slate-900">{verifyResult.recordId}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Visit Date:</span>
                    <p className="font-semibold text-slate-900">{verifyResult.visitDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Authorized Physician:</span>
                    <p className="font-semibold text-slate-900">{verifyResult.authorizedDoctor}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Patient Initials:</span>
                    <p className="font-semibold text-slate-900">{verifyResult.patientInitials}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Issuing Authority:</span>
                    <p className="font-semibold text-slate-900">{verifyResult.issuedBy}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Timestamp:</span>
                    <p className="font-mono text-[10px] text-slate-600">{verifyResult.verifiedAt}</p>
                  </div>
                </div>

                <p className="text-[10px] text-emerald-700 italic pt-1">
                  Verified live against the server database registry. No sensitive clinical notes leaked.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
