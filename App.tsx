import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import type { PlanData } from './types.ts';
import HomePage from './pages/HomePage.tsx';
import CreateInvoicePage from './pages/CreateInvoicePage.tsx';
import AuthPage from './pages/AuthPage.tsx'; 
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { PlanProvider, usePlans } from './contexts/PlanContext.tsx';
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
import AdminMessagesView from './components/admin/AdminMessagesView.tsx';
import PublicInvoicePage from './pages/PublicInvoicePage.tsx';
import AboutUsPage from './pages/AboutUsPage.tsx';
import ContactUsPage from './pages/ContactUsPage.tsx';
import MainLayout from './components/MainLayout.tsx';
import AppLayout from './components/AppLayout.tsx';
import CreateInvoiceLayout from './components/CreateInvoiceLayout.tsx';
import ClientsPage from './pages/ClientsPage.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import TaxesPage from './pages/TaxesPage.tsx';
import QuotesPage from './pages/QuotesPage.tsx';
import RecurringPage from './pages/RecurringPage.tsx';
import ReportsPage from './pages/ReportsPage.tsx';
import ApiSettingsPage from './pages/ApiSettingsPage.tsx';
import BlogListPage from './pages/BlogListPage.tsx';
import BlogPostPage from './pages/BlogPostPage.tsx';
import AdminBlogsView from './components/admin/AdminBlogsView.tsx';
import TeamPage from './pages/TeamPage.tsx';

const { HashRouter, Routes, Route, Navigate } = ReactRouterDOM;

const PageSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse p-4">
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

// New component to protect routes based on plan features
const FeatureProtectedRoute: React.FC<{ children: JSX.Element; feature: keyof PlanData }> = ({ children, feature }) => {
    const { currentUserPlan, loading: planLoading } = usePlans();
    
    if (planLoading) {
        return <PageSkeleton />;
    }

    if (!currentUserPlan || !currentUserPlan[feature]) {
        // Redirect to pricing page if the feature is not available on the current plan.
        return <Navigate to="/pricing" replace />; 
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
              {/* Public Routes with standard Navbar and Footer */}
              <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/blog" element={<BlogListPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/about" element={<AboutUsPage />} />
                  <Route path="/contact" element={<ContactUsPage />} />
              </Route>
              
              {/* Authenticated User Routes (with sidebar) */}
              <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                 <Route path="dashboard" element={<DashboardPage />} />
                 <Route path="invoices" element={<UserInvoicesPage />} />
                 <Route path="quotes" element={<QuotesPage />} />
                 <Route path="recurring" element={<RecurringPage />} />
                 <Route path="clients" element={<ClientsPage />} />
                 <Route path="products" element={<ProductsPage />} />
                 <Route path="taxes" element={<TaxesPage />} />
                 <Route path="team" element={<TeamPage />} />
                 <Route path="reports" element={
                    <FeatureProtectedRoute feature="advanced_reports">
                      <ReportsPage />
                    </FeatureProtectedRoute>
                 } />
                 <Route path="settings" element={<SettingsPage />} />
                 <Route path="api-settings" element={
                    <FeatureProtectedRoute feature="api_access">
                      <ApiSettingsPage />
                    </FeatureProtectedRoute>
                 } />
              </Route>

              {/* Invoice creation/editing routes (focused layout without sidebar) */}
              <Route element={<ProtectedRoute><CreateInvoiceLayout /></ProtectedRoute>}>
                <Route path="create" element={<CreateInvoicePage />} />
                <Route path="invoice/:invoiceDbId" element={<CreateInvoicePage />} />
              </Route>

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
                <Route path="blogs" element={<AdminBlogsView />} />
                <Route path="payments" element={<AdminPaymentsView />} />
                <Route path="integrations" element={<AdminIntegrationsView />} />
                <Route path="messages" element={<AdminMessagesView />} />
              </Route>
              
              {/* Standalone routes without any layout */}
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