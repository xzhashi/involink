


import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import CreateInvoicePage from './pages/CreateInvoicePage.tsx';
import AuthPage from './pages/AuthPage.tsx'; 
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { PlanProvider } from './contexts/PlanContext.tsx'; // New: Import PlanProvider
import UserInvoicesPage from './pages/UserInvoicesPage.tsx'; 
import DashboardPage from './pages/DashboardPage.tsx'; 
import SettingsPage from './pages/SettingsPage.tsx';   
import PricingPage from './pages/PricingPage.tsx';     
import AdminPageLayout from './pages/AdminPageLayout.tsx'; 
import AdminDashboardView from './components/admin/AdminDashboardView.tsx';
import AdminUsersView from './components/admin/AdminUsersView.tsx';
import AdminPlansView from './components/admin/AdminPlansView.tsx';
import AdminPaymentsView from './components/admin/AdminPaymentsView.tsx';

const PageSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-9 bg-slate-200 rounded w-1/3"></div>
        <div className="h-10 bg-slate-200 rounded w-32"></div>
      </div>
      <div className="bg-slate-200 rounded-lg h-96"></div>
    </div>
  );
};

// ProtectedRoute component
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// AdminProtectedRoute component
const AdminProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
     return <PageSkeleton />;
  }

  if (!user || !isAdmin) {
    // If not admin, redirect to a general page like home or user dashboard
    return <Navigate to="/dashboard" replace />; 
  }

  return children;
};


const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <CreateInvoicePage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/invoice/:invoiceDbId" 
            element={
              <ProtectedRoute>
                <CreateInvoicePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoices"
            element={
              <ProtectedRoute>
                <UserInvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/pricing"
            element={ 
                <PricingPage />
            }
          />
          {/* Admin Routes */}
          <Route 
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminPageLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardView />} />
            <Route path="users" element={<AdminUsersView />} />
            <Route path="plans" element={<AdminPlansView />} />
            <Route path="payments" element={<AdminPaymentsView />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <PlanProvider> {/* New: Wrap with PlanProvider */}
          <AppContent />
        </PlanProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;