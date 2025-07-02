import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar.tsx';
import AdminNavbar from '../components/admin/AdminNavbar.tsx';

const AdminPageLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-neutral-lightest">
      <AdminSidebar />
      <div className="flex-grow flex flex-col md:ml-64">
        <AdminNavbar />
        <main className="flex-grow p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminPageLayout;