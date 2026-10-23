import React from 'react';
import { ShieldCheck, Lock, Activity, HeartHandshake } from 'lucide-react';

interface FooterProps {
  onOpenDocs: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDocs }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-base">Secure Healthcare</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A modern, verified platform for secure patient appointment scheduling, protected medical
              record distribution, and tamper-evident healthcare workflows.
            </p>
            <div className="text-xs text-teal-400 font-medium">Your Health, Our Priority</div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Core Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>Doctor Directory & Availability</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                <span>Collision-Free Appointment Booking</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Role-Based Medical Records</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span>Doctor Prescriptions & Vitals</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span>Privacy-Preserving QR Verification</span>
              </li>
            </ul>
          </div>

          {/* Security & Architecture */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Security Architecture
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Bcrypt Salted Password Hashing</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>HMAC-SHA256 JWT Authorization</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Comprehensive Audit Event Log</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-indigo-400" />
                <span>Zero-Trust Record Isolation</span>
              </li>
            </ul>
          </div>

          {/* Project & Disclaimer */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Project Information
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Designed and engineered as a TYCS Computer Science Capstone Project demonstrating real-world
              software engineering, full-stack REST API development, and data security.
            </p>
            <button
              onClick={onOpenDocs}
              className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2"
            >
              <span>Explore Technical Architecture & Test Cases →</span>
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            © 2026 Secure Healthcare System. All rights reserved.
          </div>
          <div className="mt-2 sm:mt-0 text-[11px] text-slate-500">
            Engineered with React, Node.js, Express & MongoDB / Mongoose.
          </div>
        </div>
      </div>
    </footer>
  );
};
