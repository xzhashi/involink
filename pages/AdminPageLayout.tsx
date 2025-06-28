
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';

const AdminPageLayout: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-8rem)]"> {/* Adjust min-height as needed */}
      <AdminSidebar />
      <div className="flex-grow p-6 md:p-8 bg-neutral-lightest">
        <Outlet /> {/* Nested admin routes will render here */}
      </div>
    </div>
  );
};

export default AdminPageLayout;
