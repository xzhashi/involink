
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-light border-t border-neutral-light mt-12 py-8 text-center text-neutral-DEFAULT text-sm no-print">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} Invoice Maker <span className="text-xs opacity-90">by LinkFC</span>. All rights reserved.</p>
        <p className="mt-1">Built with React, Tailwind CSS, and Gemini API.</p>
      </div>
    </footer>
  );
};

export default Footer;