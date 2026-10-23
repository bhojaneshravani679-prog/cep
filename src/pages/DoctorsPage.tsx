import React, { useState, useEffect } from 'react';
import type { Doctor } from '../types/index.ts';
import { api } from '../services/api.ts';
import { DoctorCard } from '../components/DoctorCard.tsx';
import { Search, Filter, Stethoscope, RefreshCw, AlertCircle } from 'lucide-react';

interface DoctorsPageProps {
  onSelectDoctor: (doctor: Doctor) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({ onSelectDoctor }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [specialization, setSpecialization] = useState<string>('All');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.doctors.getAll({
        search: search.trim() || undefined,
        specialization: specialization !== 'All' ? specialization : undefined,
        verifiedOnly: verifiedOnly || undefined,
      });

      if (res.success && res.doctors) {
        setDoctors(res.doctors);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load doctors list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialization, verifiedOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const specializations = [
    'All',
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Dentist',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <Stethoscope className="w-4 h-4" />
          <span>Doctor Directory & Clinical Specialists</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Find & Schedule With Specialists</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Browse verified physicians and licensed practitioners across various medical departments.
          Select any specialist to check slot availability and reserve your appointment.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by doctor name, qualification, or hospital..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSpecialization('All');
              setVerifiedOnly(false);
              fetchDoctors();
            }}
            className="p-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center"
            title="Reset filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>

        {/* Specialization Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Specialty:</span>
            </span>
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => setSpecialization(spec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  specialization === spec
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Verified doctors only</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Doctors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 rounded-2xl bg-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Doctors Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No specialists match your search criteria. Try clearing search filters or changing the
            selected department.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor._id}
              doctor={doctor}
              onBookAppointment={(doc) => onSelectDoctor(doc)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
