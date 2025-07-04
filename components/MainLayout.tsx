import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Navbar from './Navbar.tsx';
import Footer from './Footer.tsx';

const { Outlet, useLocation } = ReactRouterDOM;

const MainLayout: React.FC = () => {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow container mx-auto px-4">
        <div key={location.pathname} className="page-fade-in">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;