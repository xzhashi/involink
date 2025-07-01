


import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import CreateInvoicePage from './pages/CreateInvoicePage.tsx';
import AuthPage from './pages/AuthPage.tsx'; 
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { PlanProvider } from './contexts/PlanContext.tsx';
import { LocalizationProvider } from './contexts/LocalizationContext.tsx';
import UserInvoicesPage from './pages/UserInvoicesPage.tsx'; 
import DashboardPage from './pages/DashboardPage.tsx'; 
import SettingsPage from './pages/SettingsPage.tsx';   
import PricingPage from './pages/PricingPage.tsx';     
import AdminPageLayout from './pages/AdminPageLayout.tsx'; 
import AdminDashboardView from './components/admin/AdminDashboardView.tsx';
import AdminUsersView from './components/admin/AdminUsersView.tsx';
import AdminPlansView from './components/admin/AdminPlansView.tsx';
import AdminPaymentsView from './components/admin/AdminPaymentsView.tsx';
import AdminIntegrationsView from './components/admin/AdminIntegrationsView.tsx';
import PublicInvoicePage from './pages/PublicInvoicePage.tsx';
import AboutUsPage from './pages/AboutUsPage.tsx';
import ContactUsPage from './pages/ContactUsPage.tsx';
import MainLayout from './components/MainLayout.tsx';

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

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <PlanProvider>
          <LocalizationProvider>
           <Routes>
              {/* Routes with standard Navbar and Footer */}
              <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/about" element={<AboutUsPage />} />
                  <Route path="/contact" element={<ContactUsPage />} />
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
                    <Route path="integrations" element={<AdminIntegrationsView />} />
                  </Route>
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
              </Route>
              
              {/* Standalone routes without the main layout */}
              <Route path="/view/invoice/:invoiceDbId" element={<PublicInvoicePage />} />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </LocalizationProvider>
        </PlanProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;