import type {
  User,
  Doctor,
  Appointment,
  MedicalRecord,
  Prescription,
  AuditLog,
  AdminStats,
  DoctorVerificationStatus,
} from '../types/index.ts';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('shs_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Authentication
  auth: {
    register: async (payload: {
      name: string;
      email: string;
      password: string;
      confirmPassword?: string;
      phone?: string;
    }) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return handleResponse<{
        success: boolean;
        message: string;
        token: string;
        user: User;
      }>(res);
    },

    login: async (payload: { email: string; password: string }) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return handleResponse<{
        success: boolean;
        message: string;
        token: string;
        user: User;
      }>(res);
    },

    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<{ success: boolean; user: User }>(res);
    },

    updateProfile: async (payload: { name?: string; phone?: string }) => {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });
      return handleResponse<{ success: boolean; message: string; user: User }>(res);
    },
  },

  // Doctors
  doctors: {
    getAll: async (params?: { search?: string; specialization?: string; verifiedOnly?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.specialization) query.append('specialization', params.specialization);
      if (params?.verifiedOnly) query.append('verifiedOnly', 'true');

      const res = await fetch(`${API_BASE}/doctors?${query.toString()}`);
      return handleResponse<{ success: boolean; count: number; doctors: Doctor[] }>(res);
    },

    getById: async (id: string) => {
      const res = await fetch(`${API_BASE}/doctors/${id}`);
      return handleResponse<{ success: boolean; doctor: Doctor; availableSlots: string[] }>(res);
    },

    create: async (data: Partial<Doctor>) => {
      const res = await fetch(`${API_BASE}/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      return handleResponse<{ success: boolean; message: string; doctor: Doctor }>(res);
    },

    update: async (id: string, data: Partial<Doctor>) => {
      const res = await fetch(`${API_BASE}/doctors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      return handleResponse<{ success: boolean; message: string; doctor: Doctor }>(res);
    },

    updateVerification: async (id: string, verificationStatus: DoctorVerificationStatus) => {
      const res = await fetch(`${API_BASE}/doctors/${id}/verification`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ verificationStatus }),
      });
      return handleResponse<{ success: boolean; message: string; doctor: Doctor }>(res);
    },
  },

  // Appointments
  appointments: {
    book: async (data: {
      doctorId: string;
      appointmentDate: string;
      appointmentTime: string;
      reasonForVisit: string;
    }) => {
      const res = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      return handleResponse<{
        success: boolean;
        message: string;
        appointment: Appointment;
      }>(res);
    },

    getAll: async (params?: { status?: string; doctorId?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.doctorId) query.append('doctorId', params.doctorId);

      const res = await fetch(`${API_BASE}/appointments?${query.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<{
        success: boolean;
        count: number;
        appointments: Appointment[];
      }>(res);
    },

    getById: async (id: string) => {
      const res = await fetch(`${API_BASE}/appointments/${id}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<{ success: boolean; appointment: Appointment }>(res);
    },

    updateStatus: async (id: string, status: string, note?: string) => {
      const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status, note }),
      });
      return handleResponse<{
        success: boolean;
        message: string;
        appointment: Appointment;
      }>(res);
    },

    cancel: async (id: string, reason?: string) => {
      const res = await fetch(`${API_BASE}/appointments/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ reason }),
      });
      return handleResponse<{
        success: boolean;
        message: string;
        appointment: Appointment;
      }>(res);
    },
  },

  // Medical Records
  medicalRecords: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/medical-records`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<{
        success: boolean;
        count: number;
        records: MedicalRecord[];
      }>(res);
    },

    getById: async (id: string) => {
      const res = await fetch(`${API_BASE}/medical-records/${id}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<{
        success: boolean;
        record: MedicalRecord;
        prescription?: Prescription;
      }>(res);
    },

    create: async (payload: {
      patientId: string;
      appointmentId?: string;
      visitDate: string;
      diagnosis: string;
      treatmentNotes: string;
      vitals?: any;
      medications?: any[];
      prescriptionInstructions?: string;
    }) => {
      const res = await fetch(`${API_BASE}/medical-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });
      return handleResponse<{
        success: boolean;
        message: string;
        record: MedicalRecord;
        prescription?: Prescription;
      }>(res);
    },

    verifyByQR: async (hash: string) => {
      const res = await fetch(`${API_BASE}/medical-records/verify/${hash}`);
      return handleResponse<{
        success: boolean;
        valid: boolean;
        verificationData: {
          recordId: string;
          visitDate: string;
          authorizedDoctor: string;
          patientInitials: string;
          issuedBy: string;
          verifiedAt: string;
          status: string;
        };
      }>(res);
    },
  },

  // Prescriptions
  prescriptions: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/prescriptions`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<{
        success: boolean;
        count: number;
        prescriptions: Prescription[];
      }>(res);
    },

    getById: async (id: string) => {
      const res = await fetch(`${API_BASE}/prescriptions/${id}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<{ success: boolean; prescription: Prescription }>(res);
    },
  },

  // Admin
  admin: {
    getStats: async () => {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<{
        success: boolean;
        statistics: AdminStats;
        databaseStatus: any;
      }>(res);
    },

    getUsers: async () => {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<{ success: boolean; count: number; users: User[] }>(res);
    },

    toggleUserStatus: async (userId: string) => {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { ...getAuthHeader() },
      });
      return handleResponse<{ success: boolean; message: string; user: User }>(res);
    },

    getAuditLogs: async (params?: { action?: string; resourceType?: string; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.action) query.append('action', params.action);
      if (params?.resourceType) query.append('resourceType', params.resourceType);
      if (params?.limit) query.append('limit', String(params.limit));

      const res = await fetch(`${API_BASE}/admin/audit-logs?${query.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<{ success: boolean; count: number; logs: AuditLog[] }>(res);
    },
  },

  // System Health
  system: {
    getHealth: async () => {
      const res = await fetch(`${API_BASE}/health`);
      return handleResponse<{
        success: boolean;
        status: string;
        service: string;
        timestamp: string;
        database: any;
      }>(res);
    },
  },
};
