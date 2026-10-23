import React, { useState, useEffect } from 'react';
import type { Doctor } from '../types/index.ts';
import { api } from '../services/api.ts';
import { DoctorCard } from '../components/DoctorCard.tsx';
import {
  ShieldCheck,
  Calendar,
  Lock,
  UserCheck,
  Search,
  ArrowRight,
  Database,
  QrCode,
  Sparkles,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenDocs: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectDoctor,
  onOpenAuth,
  onOpenDocs,
}) => {
  const [featuredDoctors, setFeaturedDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedDoctors();
  }, []);

  const fetchFeaturedDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.doctors.getAll();
      if (res.success && res.doctors) {
        setFeaturedDoctors(res.doctors.slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load featured doctors', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('doctors');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Next-Generation Healthcare Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Secure Healthcare System
              </h1>

              <div className="text-xl font-semibold text-teal-700">
                Your Health, Our Priority.
              </div>

              <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
                A modern, patient-first clinical ecosystem designed for seamless doctor discovery,
                verifiable collision-free appointment scheduling, and protected medical records with
                cryptographic tamper verification.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('book')}
                  className="px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book an Appointment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('doctors')}
                  className="px-5 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-slate-500" />
                  <span>Find a Doctor</span>
                </button>

                <button
                  onClick={onOpenDocs}
                  className="px-4 py-3.5 rounded-xl text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Project Specs</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
                <div>
                  <div className="text-2xl font-bold text-slate-900">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Bcrypt Salted & Hashed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-teal-700">RBAC</div>
                  <div className="text-xs text-slate-500 font-medium">Strict Role Isolation</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">Zero-Leak</div>
                  <div className="text-xs text-slate-500 font-medium">Opaque QR Verification</div>
                </div>
              </div>
            </div>

            {/* Right Card / Search Widget */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200 relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                      <Search className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900 text-sm">Quick Appointment Search</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Real-time Slots
                  </span>
                </div>

                <form onSubmit={handleSearchSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Doctor Name or Specialization
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Cardiologist, Dr. Ananya Sharma..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Department
                    </label>
                    <select
                      onChange={() => onNavigate('doctors')}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 bg-white"
                    >
                      <option value="">All Clinical Specializations</option>
                      <option value="General Physician">General Physician</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Dentist">Dentist</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-md transition-all cursor-pointer"
                  >
                    Browse Available Specialists
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Need an account?</span>
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Register as Patient →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find a Doctor Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Doctor Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Our Medical Specialists
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Meet our board-certified physicians, cardiologists, dermatologists, and dentists.
              All sample profiles are clearly designated until administrative verification.
            </p>
          </div>
          <button
            onClick={() => onNavigate('doctors')}
            className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View All Doctors & Time Slots</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                onBookAppointment={(doc) => onSelectDoctor(doc)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Key Architectural Features Section */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-2.5 py-1 rounded-full">
              Robust Engineering
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Features & Healthcare Security Standards
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Engineered for data integrity, authenticated authorization boundaries, and clinical
              transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                Bcrypt Password Protection
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Credentials are salted and hashed using bcrypt before persistent storage. Plain-text
                passwords are never saved, stored, or revealed in any API response.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                Role-Based Access Control (RBAC)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict separation between Patient, Doctor, and Administrator roles. Patients only view
                their own records; doctors access only assigned clinical data; admins oversee operations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                Double-Booking Collision Prevention
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Server-side collision verification checks doctor schedules and time slot availability.
                Past booking dates are mathematically rejected.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                Zero-Leak QR Record Verification
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                QR codes embed opaque reference tokens without exposing private medical symptoms or
                JWTs. Scanners verify validity against the backend registry with minimal public data.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                Comprehensive Audit Logging
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every sensitive event—login attempts, appointments, medical record lookups, prescription
                issuances—is recorded in an immutable audit ledger with actor and timestamp.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                Database & Schema Fidelity
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Built with full Mongoose schemas for User, Doctor, Appointment, MedicalRecord,
                Prescription, and AuditLog, with indexes and referential constraints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy Statement */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full">
              Security & Privacy Policy
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold">
              Patient Data Sovereignty & Confidentiality
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Patient health records are confidential. In our architecture, no client-side role can
              bypass server-side authorization. Session tokens are signed using standard HMAC algorithms,
              and patient identifiers are derived exclusively from verified server tokens—never trusted
              from public request bodies.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Log In to Verify Access
              </button>
              <button
                onClick={onOpenDocs}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900/30 transition-colors cursor-pointer"
              >
                Review Audit Log & Security Matrix
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
