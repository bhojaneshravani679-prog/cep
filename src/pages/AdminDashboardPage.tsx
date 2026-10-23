import React, { useState, useEffect } from 'react';
import type { AdminStats, User, Doctor, AuditLog } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  ShieldAlert,
  Database,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  Clock,
  Activity,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Tab switcher
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'doctors' | 'audit'>('overview');

  // Add doctor modal state
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState<boolean>(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    specialization: 'General Physician',
    qualifications: '',
    experienceYears: 5,
    consultationFee: 50,
    hospitalAffiliation: 'Metro General Hospital',
    bio: '',
  });

  // Audit log filter
  const [auditFilter, setAuditFilter] = useState<string>('ALL');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, usersRes, docsRes, logsRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers(),
        api.doctors.getAll(),
        api.admin.getAuditLogs({ resourceType: auditFilter !== 'ALL' ? auditFilter : undefined }),
      ]);

      if (statsRes.success) {
        setStats(statsRes.statistics);
        setDbStatus(statsRes.databaseStatus);
      }
      if (usersRes.success) setUsers(usersRes.users);
      if (docsRes.success) setDoctors(docsRes.doctors);
      if (logsRes.success) setAuditLogs(logsRes.logs);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user, auditFilter]);

  const handleToggleUserStatus = async (userId: string) => {
    try {
      setError(null);
      const res = await api.admin.toggleUserStatus(userId);
      if (res.success) {
        setSuccessMsg(res.message);
        fetchAdminData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user status.');
    }
  };

  const handleToggleDoctorVerification = async (doc: Doctor) => {
    try {
      setError(null);
      const nextStatus = doc.verificationStatus === 'verified' ? 'sample' : 'verified';
      const res = await api.doctors.updateVerification(doc._id, nextStatus);
      if (res.success) {
        setSuccessMsg(`Doctor status updated to "${nextStatus}".`);
        fetchAdminData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update verification status.');
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await api.doctors.create({
        ...newDoctor,
        verificationStatus: 'verified',
        isSample: false,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: { start: '09:00', end: '17:00' },
        slotDurationMinutes: 30,
      });

      if (res.success) {
        setSuccessMsg(`Doctor profile created for ${newDoctor.name}`);
        setIsAddDoctorOpen(false);
        setNewDoctor({
          name: '',
          email: '',
          specialization: 'General Physician',
          qualifications: '',
          experienceYears: 5,
          consultationFee: 50,
          hospitalAffiliation: 'Metro General Hospital',
          bio: '',
        });
        fetchAdminData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create doctor.');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
          <LayoutDashboard className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Administrator Access Required</h2>
        <p className="text-xs text-slate-500 mt-2">
          Public users cannot access system controls or audit logs. Please sign in with administrator
          privileges.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span>Administrative Command & Compliance</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">System Administration</h1>
          <p className="text-xs text-slate-500 mt-1">
            System metrics, user directory management, doctor credential verification, and audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAdminData}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh System State</span>
          </button>

          <button
            onClick={() => setIsAddDoctorOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Doctor</span>
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

      {/* Database & Runtime Engine Status */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-100 text-sm">Database Engine Health:</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  dbStatus?.isMongoConnected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                {dbStatus?.isMongoConnected ? 'MongoDB Atlas Live' : 'Active High-Integrity Store'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">{dbStatus?.statusMessage}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-[11px] text-slate-400">
          <div>
            Total Entities: <strong className="text-white">{stats?.totalUsers || 0} users</strong>
          </div>
          <div>•</div>
          <div>
            Audit Trail: <strong className="text-white">{auditLogs.length} events logged</strong>
          </div>
        </div>
      </div>

      {/* Real Statistics Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-medium">Registered Patients</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats?.patientCount || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-medium">Total Specialists</span>
          <div className="text-2xl font-bold text-teal-600 mt-1">{stats?.doctorCount || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-medium">All Appointments</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalAppointments || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-medium">Pending Review</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats?.pendingAppointments || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-medium">Confirmed / Done</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {(stats?.confirmedAppointments || 0) + (stats?.completedAppointments || 0)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-medium">Clinical Records</span>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {stats?.medicalRecordsCount || 0}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview & Doctor Verification
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          User Accounts Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'audit'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Doctors Management */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Medical Doctor Directory Controls</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage doctor credentials, clinical profiles, and toggle demonstration sample badges.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Doctor Name</th>
                  <th className="py-3 px-6">Specialization & Qualifications</th>
                  <th className="py-3 px-6">Fee & Experience</th>
                  <th className="py-3 px-6">Verification Status</th>
                  <th className="py-3 px-6 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{doc.name}</div>
                      <div className="text-slate-400 text-[11px]">{doc.email || 'No email set'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-blue-700">{doc.specialization}</div>
                      <div className="text-slate-500 text-[11px] truncate max-w-xs">
                        {doc.qualifications}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900">${doc.consultationFee}</span>
                      <span className="text-slate-400 text-[11px]"> ({doc.experienceYears}y exp)</span>
                    </td>
                    <td className="py-4 px-6">
                      {doc.verificationStatus === 'verified' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                          <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                          Sample Profile
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleDoctorVerification(doc)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          doc.verificationStatus === 'verified'
                            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        {doc.verificationStatus === 'verified'
                          ? 'Mark as Sample'
                          : 'Verify Doctor'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: User Accounts */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">User Identity & Access Controls</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review registered patients, doctors, and admins. Password hashes are never displayed.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">User</th>
                  <th className="py-3 px-6">Email Address</th>
                  <th className="py-3 px-6">Assigned Role</th>
                  <th className="py-3 px-6">Account Status</th>
                  <th className="py-3 px-6 text-right">Access Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-slate-400 text-[10px]">ID: {u.id}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">{u.email}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'doctor'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.accountStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {u.id !== user.id && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                            u.accountStatus === 'active'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {u.accountStatus === 'active' ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-700">
                <ShieldAlert className="w-4 h-4" />
                <span>Immutable Security Event Trail</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                Clinical & Security Audit Records
              </h2>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500">Resource:</span>
              <select
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
              >
                <option value="ALL">All Categories</option>
                <option value="AUTH">Authentication Events</option>
                <option value="APPOINTMENT">Appointments</option>
                <option value="MEDICAL_RECORD">Clinical Records</option>
                <option value="PRESCRIPTION">Prescriptions</option>
                <option value="DOCTOR">Doctor Modifications</option>
                <option value="USER">User Status Changes</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Timestamp & IP</th>
                  <th className="py-3 px-6">Actor</th>
                  <th className="py-3 px-6">Action</th>
                  <th className="py-3 px-6">Resource</th>
                  <th className="py-3 px-6">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <div className="text-slate-800 font-semibold">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        {new Date(log.timestamp).toLocaleDateString()} • {log.ipAddress}
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      <div className="text-slate-900 font-sans font-bold">{log.actorEmail}</div>
                      <div className="text-slate-400 text-[10px] uppercase font-sans">
                        {log.actorRole}
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-6">
                      <span className="text-slate-600 font-sans">{log.resourceType}</span>
                      {log.resourceId && (
                        <div className="text-slate-400 text-[10px]">{log.resourceId}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-6 font-sans text-slate-600 max-w-sm">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {isAddDoctorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add New Medical Doctor</h3>
              <button
                onClick={() => setIsAddDoctorOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Kavita Nair"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="dr.kavita@healthcare.org"
                  value={newDoctor.email}
                  onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specialization *</label>
                  <select
                    value={newDoctor.specialization}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Dentist">Dentist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Orthopedic">Orthopedic</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fee ($) *</label>
                  <input
                    type="number"
                    value={newDoctor.consultationFee}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, consultationFee: Number(e.target.value) })
                    }
                    min={0}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Qualifications *</label>
                <input
                  type="text"
                  placeholder="e.g. MBBS, MD - General Medicine"
                  value={newDoctor.qualifications}
                  onChange={(e) => setNewDoctor({ ...newDoctor, qualifications: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={newDoctor.experienceYears}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, experienceYears: Number(e.target.value) })
                    }
                    min={0}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hospital</label>
                  <input
                    type="text"
                    value={newDoctor.hospitalAffiliation}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, hospitalAffiliation: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Bio</label>
                <textarea
                  rows={2}
                  placeholder="Doctor biography and clinical focus..."
                  value={newDoctor.bio}
                  onChange={(e) => setNewDoctor({ ...newDoctor, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDoctorOpen(false)}
                  className="px-4 py-2 text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
                >
                  Create Doctor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
