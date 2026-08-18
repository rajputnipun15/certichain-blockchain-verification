import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { PublicVerifyPage } from './pages/PublicVerifyPage';
import { DemoPage } from './pages/DemoPage';
import { SecurityLabPage } from './pages/SecurityLabPage';
import { BlockchainExplorer } from './pages/BlockchainExplorer';
import { MerkleExplorerPage } from './pages/MerkleExplorerPage';
import { InstitutionDashboard } from './pages/InstitutionDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { LoginPage } from './pages/LoginPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: string }> = ({ children, allowedRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-navy-950 text-white flex items-center justify-center">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-navy-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/verify" element={<PublicVerifyPage />} />
          <Route path="/verify/:certificateId" element={<PublicVerifyPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/security-lab" element={<SecurityLabPage />} />
          <Route path="/explorer" element={<BlockchainExplorer />} />
          <Route path="/merkle-tree" element={<MerkleExplorerPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboards */}
          <Route
            path="/dashboard/institution"
            element={
              <ProtectedRoute allowedRole="INSTITUTION_ADMIN">
                <InstitutionDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
