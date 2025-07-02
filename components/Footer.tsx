import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-off-white border-t border-secondary mt-12 py-6 text-center text-neutral-DEFAULT text-xs no-print">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} Invoice Maker by LinkFC. All rights reserved.</p>
        <p className="mt-1 opacity-75">Built by LinkFC</p>
      </div>
    </footer>
  );
};

export default Footer;