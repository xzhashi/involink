
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import AuthPage from './pages/AuthPage'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlanProvider } from './contexts/PlanContext'; // New: Import PlanProvider
import UserInvoicesPage from './pages/UserInvoicesPage'; 
import DashboardPage from './pages/DashboardPage'; 
import SettingsPage from './pages/SettingsPage';   
import PricingPage from './pages/PricingPage';     
import AdminPageLayout from './pages/AdminPageLayout'; 
import AdminDashboardView from './components/admin/AdminDashboardView';
import AdminUsersView from './components/admin/AdminUsersView';
import AdminPlansView from './components/admin/AdminPlansView';
import AdminPaymentsView from './components/admin/AdminPaymentsView';


// ProtectedRoute component
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    ); 
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
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading Admin Access...</p>
      </div>
    );
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
