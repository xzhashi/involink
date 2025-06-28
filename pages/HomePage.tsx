
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { AVAILABLE_TEMPLATES } from '../constants';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon'; // New icon for CTA
import { AbstractHeroPattern } from '../components/icons/AbstractHeroPattern'; // New SVG background

// Using a generic document/template icon for "Beautiful Templates"
const TemplateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);


const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-start border border-transparent hover:border-primary-light/30">
    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-light to-secondary-DEFAULT text-white rounded-lg shadow-md mb-5">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-neutral-darkest mb-2">{title}</h3>
    <p className="text-neutral-DEFAULT text-sm leading-relaxed">{description}</p>
  </div>
);

const HomePage: React.FC = () => {
  return (
    <div className="space-y-20 sm:space-y-28 md:space-y-32">
      {/* Hero Section */}
      <section className="relative text-center py-20 sm:py-28 md:py-32 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl shadow-2xl overflow-hidden">
        <AbstractHeroPattern className="absolute inset-0 w-full h-full object-cover opacity-10 text-slate-700" />
        <div className="relative container mx-auto px-4 z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Craft Stunning Invoices, <span className="text-primary-light block sm:inline">Effortlessly.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300/80 mb-10 max-w-2xl mx-auto">
            Invoice Maker blends cutting-edge AI with beautiful design to help you create professional invoices in record time.
          </p>
          <Link to="/create">
            <Button 
              size="lg" 
              className="bg-primary-DEFAULT hover:bg-primary-dark text-white shadow-lg hover:shadow-xl transform hover:scale-105 !px-8 !py-3.5"
              rightIcon={<ArrowRightIcon className="w-5 h-5 ml-2" />}
            >
              Start Creating Now
            </Button>
          </Link>
          <p className="text-sm text-slate-400/70 mt-6">Free to start, no credit card required.</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-neutral-darkest mb-4">The Future of Invoicing is Here.</h2>
        <p className="text-lg text-neutral-DEFAULT text-center mb-12 sm:mb-16 max-w-xl mx-auto">
            Discover features designed to save you time and impress your clients.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            title="AI-Powered Intelligence" 
            description="Leverage Gemini API for smart item descriptions, professional notes, and insightful suggestions." 
            icon={<SparklesIcon className="w-6 h-6" />}
          />
          <FeatureCard 
            title="Exquisite Templates" 
            description="Choose from a curated collection of modern, classic, and creative templates to perfectly match your brand." 
            icon={<TemplateIcon className="w-6 h-6" />}
          />
          <FeatureCard 
            title="Seamless Experience" 
            description="Intuitive interface, easy customization, and quick PDF downloads. Share with a click." 
            icon={<DownloadIcon className="w-6 h-6" />} // Could use a more generic "Easy" icon
          />
        </div>
      </section>

      {/* Template Showcase Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-neutral-darkest mb-4">Find Your Perfect Look</h2>
         <p className="text-lg text-neutral-DEFAULT text-center mb-12 sm:mb-16 max-w-xl mx-auto">
            Browse a few of our popular designs. More available inside!
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {AVAILABLE_TEMPLATES.slice(0, 3).map(template => (
            <div key={template.id} className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 group flex flex-col overflow-hidden border border-neutral-light/50 hover:border-primary-light/50 transform hover:-translate-y-1">
              <div className="overflow-hidden">
                <img src={template.thumbnailUrl} alt={template.name} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"/>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-neutral-darkest mb-2">{template.name}</h3>
                <p className="text-neutral-DEFAULT text-sm mb-4 flex-grow leading-relaxed">{template.description}</p>
                <Link to="/create" state={{ initialTemplateId: template.id }} className="mt-auto block">
                  <Button variant="ghost" size="md" className="w-full text-primary-DEFAULT hover:bg-primary-light/10 border-2 border-primary-light/50 hover:border-primary-light">
                    Use this Template
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        {AVAILABLE_TEMPLATES.length > 3 && (
            <div className="text-center mt-16">
                <Link to="/create">
                     <Button variant="primary" size="lg" className="!px-10 !py-4 shadow-lg hover:shadow-xl transform hover:scale-105">
                        Explore All Templates & Create
                     </Button>
                </Link>
            </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;