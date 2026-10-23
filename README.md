# Secure Healthcare System
> **Secure Healthcare Appointment and Medical Record Management System**
> *TYCS (Third Year Computer Science) Capstone Project*
> *Tagline: Your Health, Our Priority*

---

## 1. Project Overview

The **Secure Healthcare System** is a full-stack clinical management web application engineered for secure patient appointment scheduling, protected medical records, and role-based access control.

The system addresses critical healthcare informatics challenges:
- Preventing unauthorized access to confidential clinical data.
- Eliminating appointment double-booking race conditions.
- Enforcing verifiable identity boundaries across Patients, Doctors, and Administrators.
- Providing privacy-preserving QR code verification for medical records.
- Maintaining an immutable security audit trail for compliance auditing.

---

## 2. Technology Stack

### Frontend:
- **Framework**: React 19 (TypeScript, Hooks, Context API)
- **Styling**: Tailwind CSS v4 (Healthcare design system: white, medical blue `#2563eb`, teal `#0d9488`, emerald)
- **Icons**: Lucide React
- **Build Tool**: Vite 8

### Backend:
- **Runtime**: Node.js & Express.js
- **API Architecture**: RESTful API with JSON specifications
- **Security**:
  - `bcryptjs`: Salted password hashing (salt factor 10)
  - `jsonwebtoken` (JWT): Signed tokens with HMAC verification
  - CORS security & HTTP headers protection
  - Size-bounded request parsing
- **Persistence**:
  - **MongoDB Atlas** / **Mongoose**: Production database schemas with indexes and referential integrity
  - **Embedded High-Integrity Store**: Automatic fallback engine to ensure immediate demonstration without requiring external database provisioning

---

## 3. Pre-Seeded Demonstration Accounts (TYCS Evaluation)

To facilitate immediate examination and viva demonstration, pre-seeded accounts with various roles are ready to use:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@example.com` | `Patient@123456` | Book appointments, view own appointments, cancel appointments, view own medical records & prescriptions |
| **Doctor** | `dr.ananya@healthcare.org` | `Doctor@123456` | View assigned appointments, confirm/complete visits, author medical records, issue prescriptions |
| **Administrator** | `admin@healthcare.org` | `Admin@123456` | Real-time system statistics, manage doctors (verify/sample toggle), manage user accounts, review security audit logs |

> *Note: Visitors can also freely register new patient accounts from the "Register" tab with email validation and password policy enforcement.*

---

## 4. Key Modules & Features

### 4.1. Doctor Directory
Pre-configured with standard specialist profiles:
1. **Dr. Ananya Sharma** — General Physician (AIIMS, 12 years exp)
2. **Dr. Rahul Patil** — Cardiologist (DM Cardiology, 15 years exp)
3. **Dr. Priya Deshmukh** — Dermatologist (MD Dermatology, 9 years exp, *Sample Profile*)
4. **Dr. Amit Shah** — Dentist (MDS Prosthodontics, 8 years exp, *Sample Profile*)

### 4.2. Collision-Free Appointment Booking
- Backend checks doctor schedule and prevents concurrent double-booking of identical slots.
- Mathematical past-date rejection (cannot book dates earlier than today).
- Patient identity is derived directly from the verified server-side JWT token (`req.user.id`), not client payload.
- Unique appointment IDs generated (e.g., `APT-2026-9481`).

### 4.3. Protected Medical Records & Prescriptions
- Role-isolated clinical records: Patients only view their own records; doctors view their patients; administrators access clinical records only under explicit audit logging.
- Vitals tracking: Blood pressure, pulse rate, temperature, weight.
- Linked prescriptions with medication name, dosage, frequency, duration, and instructions.

### 4.4. Zero-Leak QR Code Verification
- Medical records include a unique verification QR code.
- **Privacy Standard**: In compliance with clinical confidentiality, private diagnoses and passwords are **never** embedded in the QR image.
- Scanners resolve an opaque token against `/api/medical-records/verify/:hash` returning only non-sensitive verification facts (Record ID, Physician, Verification Timestamp, Authenticity Status).

### 4.5. Immutable Security Audit Logging
- Every sensitive operation (login attempts, failed logins, bookings, status updates, record creation, admin inspection) creates an audit ledger document with actor identity, action type, resource, timestamp, and client IP.

---

## 5. REST API Documentation

### Authentication Routes
- `POST /api/auth/register` — Register a new patient (public registration is locked to `patient` role to block privilege escalation).
- `POST /api/auth/login` — Authenticate credentials with bcrypt and receive JWT token.
- `GET /api/auth/me` — Retrieve authenticated user profile (Bearer token required).
- `PATCH /api/auth/profile` — Update patient name or contact details.

### Doctor Routes
- `GET /api/doctors` — List all doctors with query filtering (`search`, `specialization`, `verifiedOnly`).
- `GET /api/doctors/:id` — Retrieve specific doctor details and available slots.
- `POST /api/doctors` — Add new doctor profile (*Admin only*).
- `PATCH /api/doctors/:id/verification` — Toggle verification status (*Admin only*).

### Appointment Routes
- `POST /api/appointments` — Book an appointment with slot collision detection (*Authenticated*).
- `GET /api/appointments` — List appointments (Patients see own; Doctors see assigned; Admins see all).
- `PATCH /api/appointments/:id/status` — Update appointment status (*Doctor or Admin*).
- `POST /api/appointments/:id/cancel` — Cancel appointment with mandatory reason (*Patient own, Doctor, or Admin*).

### Medical Record Routes
- `GET /api/medical-records` — List authorized medical records.
- `GET /api/medical-records/:id` — View specific clinical record with vitals and linked prescription.
- `POST /api/medical-records` — Author a medical record (*Doctor or Admin*).
- `GET /api/medical-records/verify/:hash` — Public zero-leak verification resolver.

### Admin Routes
- `GET /api/admin/stats` — Real-time database metrics.
- `GET /api/admin/users` — List registered users (passwords excluded).
- `PATCH /api/admin/users/:id/status` — Activate or deactivate user accounts.
- `GET /api/admin/audit-logs` — Review security audit records with category filters.

---

## 6. How to Run the Application

### Prerequisites:
- Node.js (v18+)
- npm

### Installation:
```bash
# Clone the repository and enter directory
cd secure-healthcare-system

# Install dependencies
npm install
```

### Environment Configuration:
Configure `.env` file (copy from `.env.example`):
```env
PORT=3000
JWT_SECRET=your-secure-jwt-secret-key-2026
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/secure_healthcare
```
*(If `MONGODB_URI` is omitted, the system seamlessly runs on the internal high-integrity persistent engine).*

### Starting the Application:
```bash
# Start full-stack development server
npm run dev

# Or build and start for production
npm run build
npm start
```
The application will be live at `http://localhost:3000`.

---

## 7. Automated Test Cases

The application includes 14 comprehensive test scenarios:
1. `TC-01`: Patient Registration Validation (Passed)
2. `TC-02`: Duplicate Email Rejection (Passed)
3. `TC-03`: Salted Bcrypt Password Protection (Passed)
4. `TC-04`: JWT Token Issuance & Signature Verification (Passed)
5. `TC-05`: Doctor Directory Retrieval with Sample Flagging (Passed)
6. `TC-06`: Past-Date Appointment Booking Rejection (Passed)
7. `TC-07`: Double-Booking Collision Prevention (Passed)
8. `TC-08`: Token Identity Derivation (Anti-Impersonation) (Passed)
9. `TC-09`: Patient Appointment Data Isolation (Passed)
10. `TC-10`: Doctor Clinical Record & Rx Issuance (Passed)
11. `TC-11`: Zero-Knowledge QR Record Verification (Passed)
12. `TC-12`: Public Admin Role Escalation Block (Passed)
13. `TC-13`: Comprehensive Security Audit Trail Recording (Passed)
14. `TC-14`: Database Fallback Resilience (Passed)

---

## 8. Summary of Completed Features

- [x] Complete frontend with responsive modern healthcare UI.
- [x] Complete backend with Express REST API and security middleware.
- [x] Mongoose data models for User, Doctor, Appointment, MedicalRecord, Prescription, AuditLog.
- [x] Role-based authentication (Patient, Doctor, Admin) with JWT and bcryptjs.
- [x] Doctor directory with Dr. Ananya Sharma, Dr. Rahul Patil, Dr. Priya Deshmukh, Dr. Amit Shah.
- [x] Collision-free appointment scheduling with past-date rejection.
- [x] "My Appointments" portal with real-time status and cancellation controls.
- [x] Clinical medical record documentation with recorded vitals.
- [x] Prescriptions with dosage, frequency, duration, and instructions.
- [x] Privacy-preserving QR code verification endpoint.
- [x] Doctor dashboard for managing assigned visits and authoring patient records.
- [x] Admin dashboard with real statistics, user status toggles, doctor verification, and audit logs.
- [x] `.env.example`, `.gitignore`, and `README.md`.
