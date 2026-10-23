import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { DoctorsPage } from './pages/DoctorsPage.tsx';
import { BookAppointmentPage } from './pages/BookAppointmentPage.tsx';
import { MyAppointmentsPage } from './pages/MyAppointmentsPage.tsx';
import { MedicalRecordsPage } from './pages/MedicalRecordsPage.tsx';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { AuthModal } from './pages/AuthModal.tsx';
import { AppointmentModal } from './components/AppointmentModal.tsx';
import { ProjectDocsModal } from './pages/ProjectDocsModal.tsx';
import type { Doctor } from './types/index.ts';

function AppContent() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [quickAppointmentModalDoctor, setQuickAppointmentModalDoctor] = useState<Doctor | null>(null);
  const [projectDocsOpen, setProjectDocsOpen] = useState<boolean>(false);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSelectDoctorForBooking = (doctor: Doctor) => {
    setSelectedDoctorForBooking(doctor);
    setQuickAppointmentModalDoctor(doctor);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuthModal={handleOpenAuth}
        openProjectDocs={() => setProjectDocsOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectDoctor={handleSelectDoctorForBooking}
            onOpenAuth={handleOpenAuth}
            onOpenDocs={() => setProjectDocsOpen(true)}
          />
        )}

        {currentTab === 'doctors' && (
          <DoctorsPage onSelectDoctor={handleSelectDoctorForBooking} />
        )}

        {currentTab === 'book' && (
          <BookAppointmentPage
            preselectedDoctor={selectedDoctorForBooking}
            onNavigate={(tab) => setCurrentTab(tab)}
            openAuthModal={() => handleOpenAuth('login')}
          />
        )}

        {currentTab === 'appointments' && (
          <MyAppointmentsPage
            onNavigate={(tab) => setCurrentTab(tab)}
            openAuthModal={() => handleOpenAuth('login')}
          />
        )}

        {currentTab === 'records' && (
          <MedicalRecordsPage openAuthModal={() => handleOpenAuth('login')} />
        )}

        {currentTab === 'doctor-dashboard' && <DoctorDashboardPage />}

        {currentTab === 'admin-dashboard' && <AdminDashboardPage />}
      </main>

      {/* Footer */}
      <Footer onOpenDocs={() => setProjectDocsOpen(true)} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Direct Booking Modal */}
      {quickAppointmentModalDoctor && (
        <AppointmentModal
          doctor={quickAppointmentModalDoctor}
          onClose={() => setQuickAppointmentModalDoctor(null)}
          onSuccess={() => {
            setCurrentTab('appointments');
          }}
          openAuthModal={() => handleOpenAuth('login')}
        />
      )}

      {/* Project Documentation and Test Cases Modal */}
      <ProjectDocsModal
        isOpen={projectDocsOpen}
        onClose={() => setProjectDocsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
