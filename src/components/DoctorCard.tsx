import React from 'react';
import type { Doctor } from '../types/index.ts';
import {
  Stethoscope,
  GraduationCap,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  onBookAppointment: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBookAppointment }) => {
  const isSample = doctor.isSample || doctor.verificationStatus === 'sample';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div className="p-5">
        {/* Verification Status Banner */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1">
            <Stethoscope className="w-3.5 h-3.5 mr-1" />
            {doctor.specialization}
          </span>

          {isSample ? (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center space-x-1"
              title="This profile is sample demonstration data until formally verified by an administrator"
            >
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>Sample Profile</span>
            </span>
          ) : (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Verified Doctor</span>
            </span>
          )}
        </div>

        {/* Doctor Info */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            {doctor.name.replace('Dr. ', '').charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">
              {doctor.name}
            </h3>
            <div className="flex items-center text-xs text-slate-500 mt-1">
              <GraduationCap className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
              <span className="truncate">{doctor.qualifications}</span>
            </div>
            {doctor.hospitalAffiliation && (
              <div className="flex items-center text-xs text-slate-500 mt-1">
                <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                <span className="truncate">{doctor.hospitalAffiliation}</span>
              </div>
            )}
          </div>
        </div>

        {doctor.bio && (
          <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
            {doctor.bio}
          </p>
        )}

        {/* Availability details */}
        <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Days:</span>
            </div>
            <span className="font-medium text-slate-800 text-right">
              {doctor.availableDays?.length > 3
                ? `${doctor.availableDays[0]} - ${doctor.availableDays[doctor.availableDays.length - 1]}`
                : doctor.availableDays?.join(', ')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>Hours:</span>
            </div>
            <span className="font-medium text-slate-800">
              {doctor.workingHours?.start} - {doctor.workingHours?.end} ({doctor.slotDurationMinutes || 30}m slots)
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200">
            <span className="text-slate-500">Consultation Fee:</span>
            <span className="font-bold text-slate-900 text-sm">
              ${doctor.consultationFee}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {doctor.experienceYears}+ years exp.
        </span>
        <button
          onClick={() => onBookAppointment(doctor)}
          className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-xs hover:shadow-sm transition-all cursor-pointer"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};
