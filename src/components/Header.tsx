import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ShieldCheck,
  Calendar,
  User as UserIcon,
  FileText,
  Stethoscope,
  LayoutDashboard,
  LogOut,
  LogIn,
  Menu,
  X,
  BookOpen,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  openProjectDocs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  openAuthModal,
  openProjectDocs,
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top security banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
              256-Bit TLS Encrypted
            </span>
            <span className="hidden sm:inline text-slate-400">
              Role-Based Access Control • Privacy-Preserving Audit Trail
            </span>
          </div>
          <button
            onClick={openProjectDocs}
            className="flex items-center space-x-1 hover:text-white transition-colors cursor-pointer text-[11px] font-medium text-emerald-400"
            title="View TYCS Project Architecture & Specifications"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>TYCS Project Docs & Test Cases</span>
          </button>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  Secure Healthcare
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                  System
                </span>
              </div>
              <p className="text-[11px] text-teal-700 font-medium">Your Health, Our Priority</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => handleNav('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'home'
                  ? 'text-blue-700 bg-blue-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('doctors')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'doctors'
                  ? 'text-blue-700 bg-blue-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Find Doctors
            </button>
            <button
              onClick={() => handleNav('book')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'book'
                  ? 'text-blue-700 bg-blue-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Book Appointment
            </button>

            {user && (
              <>
                <button
                  onClick={() => handleNav('appointments')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentTab === 'appointments'
                      ? 'text-blue-700 bg-blue-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>My Appointments</span>
                </button>
                <button
                  onClick={() => handleNav('records')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentTab === 'records'
                      ? 'text-blue-700 bg-blue-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Medical Records</span>
                </button>
              </>
            )}

            {user && (user.role === 'doctor' || user.role === 'admin') && (
              <button
                onClick={() => handleNav('doctor-dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'doctor-dashboard'
                    ? 'text-teal-700 bg-teal-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Doctor Portal</span>
              </button>
            )}

            {user && user.role === 'admin' && (
              <button
                onClick={() => handleNav('admin-dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'admin-dashboard'
                    ? 'text-indigo-700 bg-indigo-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                <span>Admin Dashboard</span>
              </button>
            )}
          </nav>

          {/* User Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-800">{user.name}</div>
                  <div className="flex items-center justify-end space-x-1">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-500'
                          : user.role === 'doctor'
                          ? 'bg-teal-500'
                          : 'bg-blue-500'
                      }`}
                    ></span>
                    <span className="text-[11px] font-medium capitalize text-slate-500">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:text-rose-600 transition-colors"
                  title="Sign out securely"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="inline-flex items-center space-x-1 px-3.5 py-2 text-sm font-medium rounded-lg text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all hover:scale-102"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          <button
            onClick={() => handleNav('home')}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('doctors')}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Find Doctors
          </button>
          <button
            onClick={() => handleNav('book')}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Book Appointment
          </button>
          {user && (
            <>
              <button
                onClick={() => handleNav('appointments')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Appointments
              </button>
              <button
                onClick={() => handleNav('records')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Medical Records
              </button>
            </>
          )}
          {user && (user.role === 'doctor' || user.role === 'admin') && (
            <button
              onClick={() => handleNav('doctor-dashboard')}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-teal-700 hover:bg-teal-50"
            >
              Doctor Portal
            </button>
          )}
          {user && user.role === 'admin' && (
            <button
              onClick={() => handleNav('admin-dashboard')}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-indigo-700 hover:bg-indigo-50"
            >
              Admin Dashboard
            </button>
          )}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openProjectDocs();
            }}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-emerald-700 hover:bg-emerald-50"
          >
            TYCS Project Guide & Test Suite
          </button>

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500 capitalize">{user.role} role</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-sm rounded-lg text-rose-600 bg-rose-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full text-center py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('register');
                  }}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
