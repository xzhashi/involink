import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { TwitterIcon } from './icons/TwitterIcon.tsx'; 
import { GithubIcon } from './icons/GithubIcon.tsx';
import { LinkedinIcon } from './icons/LinkedinIcon.tsx';

const { Link } = ReactRouterDOM;

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 text-slate-300 no-print">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center text-white hover:text-purple-300 transition-colors mb-4">
              <SparklesIcon className="h-8 w-8 mr-2 text-purple-400" />
              <span className="font-bold text-xl">Invoice Maker</span>
            </Link>
            <p className="text-sm text-slate-400">
              Crafting beautiful invoices, effortlessly. Built for modern freelancers and businesses.
            </p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-slate-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/about" className="text-slate-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-300 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          
          {/* Column 4: Socials */}
          <div>
             <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-4">Connect With Us</h3>
             <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><TwitterIcon className="h-6 w-6" /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><GithubIcon className="h-6 w-6" /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><LinkedinIcon className="h-6 w-6" /></a>
             </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} Invoice Maker by LinkFC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;