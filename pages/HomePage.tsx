import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { AVAILABLE_TEMPLATES } from '../constants';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon'; // New icon for CTA
import { AbstractHeroPattern } from '../components/icons/AbstractHeroPattern'; // New SVG background
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { ChevronUpIcon } from '../components/icons/ChevronUpIcon';

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

const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-neutral-light/80">
            <button
                className="flex justify-between items-center w-full py-5 text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-semibold text-neutral-darkest">{question}</span>
                {isOpen ? <ChevronUpIcon className="w-5 h-5 text-primary-DEFAULT" /> : <ChevronDownIcon className="w-5 h-5 text-neutral-DEFAULT" />}
            </button>
            {isOpen && <div className="pb-5 text-neutral-DEFAULT text-sm leading-relaxed">{children}</div>}
        </div>
    );
};


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
      
       {/* How It Works Section */}
      <section className="container mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-darkest mb-4">Get Started in 3 Easy Steps</h2>
        <div className="relative mt-12 grid md:grid-cols-3 gap-8 text-left">
           {/* Dashed line connector for desktop */}
           <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-transparent">
               <svg width="100%" height="100%"><line x1="0" y1="50%" x2="100%" y2="50%" strokeWidth="2" strokeDasharray="8, 8" className="stroke-primary-light/50 -translate-y-10" /></svg>
           </div>
           <div className="relative bg-white p-6 rounded-lg shadow-lg z-10">
               <div className="flex items-center text-primary-DEFAULT font-bold mb-3"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-DEFAULT text-white mr-3">1</span> CHOOSE</div>
               <h3 className="text-lg font-semibold mb-2">Select a Template</h3>
               <p className="text-sm text-neutral-DEFAULT">Pick a design that reflects your brand's personality from our diverse collection.</p>
           </div>
           <div className="relative bg-white p-6 rounded-lg shadow-lg z-10">
               <div className="flex items-center text-primary-DEFAULT font-bold mb-3"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-DEFAULT text-white mr-3">2</span> CUSTOMIZE</div>
               <h3 className="text-lg font-semibold mb-2">Add Your Details</h3>
               <p className="text-sm text-neutral-DEFAULT">Fill in your items, client info, and payment details. Use our AI for a little help!</p>
           </div>
           <div className="relative bg-white p-6 rounded-lg shadow-lg z-10">
               <div className="flex items-center text-primary-DEFAULT font-bold mb-3"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-DEFAULT text-white mr-3">3</span> SEND</div>
               <h3 className="text-lg font-semibold mb-2">Share or Download</h3>
               <p className="text-sm text-neutral-DEFAULT">Send a link to your client or download a professional PDF in seconds.</p>
           </div>
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

       {/* Testimonials Section */}
       <section className="bg-neutral-light/50 py-20">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-3xl sm:text-4xl font-bold text-neutral-darkest mb-12">Loved by Freelancers & Businesses</h2>
                 <div className="grid md:grid-cols-3 gap-8 text-left">
                     <div className="bg-white p-6 rounded-lg shadow-lg">
                         <p className="text-neutral-DEFAULT mb-4">"This is a game-changer! The AI suggestions save me so much time writing descriptions. My invoices have never looked better."</p>
                         <p className="font-semibold text-neutral-darkest">Alex R.</p>
                         <p className="text-sm text-primary-DEFAULT">Freelance Designer</p>
                     </div>
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                         <p className="text-neutral-DEFAULT mb-4">"The templates are absolutely beautiful and so easy to customize. I finally feel proud sending invoices to my clients."</p>
                         <p className="font-semibold text-neutral-darkest">Jenna M.</p>
                         <p className="text-sm text-primary-DEFAULT">Marketing Consultant</p>
                     </div>
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                         <p className="text-neutral-DEFAULT mb-4">"Quick, intuitive, and the results are incredibly professional. The UPI payment option is a fantastic touch for my Indian clients."</p>
                         <p className="font-semibold text-neutral-darkest">Sam K.</p>
                         <p className="text-sm text-primary-DEFAULT">Web Developer</p>
                     </div>
                 </div>
            </div>
       </section>

       {/* FAQ Section */}
       <section className="container mx-auto px-4">
           <h2 className="text-3xl sm:text-4xl font-bold text-center text-neutral-darkest mb-12">Frequently Asked Questions</h2>
           <div className="max-w-2xl mx-auto">
                <FaqItem question="Is Invoice Maker really free?">
                    <p>Yes! Our free plan is perfect for those just starting out. It allows you to create up to 3 invoices per month and access basic templates. For unlimited invoices and premium features, you can upgrade to our Pro plan.</p>
                </FaqItem>
                <FaqItem question="How does the AI suggestion feature work?">
                    <p>We use the powerful Google Gemini API. When you provide a keyword for an item or a context for a note, we send a secure request to the AI, which then generates professional and relevant text suggestions to help you fill out your invoice faster.</p>
                </FaqItem>
                 <FaqItem question="Can I use my own logo?">
                    <p>Absolutely! You can upload your own logo or paste an image URL. It will appear on your selected invoice template, helping you maintain a consistent and professional brand image.</p>
                </FaqItem>
                 <FaqItem question="What are the payment options?">
                    <p>You can add a custom payment link (like PayPal or Stripe) to your invoices. We also have a built-in tool to generate UPI QR codes and payment links, making it incredibly easy for clients in India to pay you instantly.</p>
                </FaqItem>
           </div>
       </section>

      {/* Final CTA Section */}
       <section className="container mx-auto px-4">
            <div className="relative text-center py-16 sm:py-20 bg-gradient-to-br from-primary-DEFAULT to-secondary-DEFAULT rounded-xl shadow-xl overflow-hidden">
                 <div className="relative z-10 text-white px-4">
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to Revolutionize Your Invoicing?</h2>
                    <p className="text-lg sm:text-xl mb-8 max-w-xl mx-auto opacity-90">Join thousands of professionals who are creating beautiful invoices in minutes.</p>
                    <Link to="/create">
                        <Button 
                            size="lg" 
                            className="bg-white text-primary-dark hover:bg-neutral-lightest !px-8 !py-3.5 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Create Your First Invoice - It's Free!
                        </Button>
                    </Link>
                </div>
            </div>
       </section>

    </div>
  );
};

export default HomePage;
