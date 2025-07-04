import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../components/common/Button.tsx';
import { SparklesIcon } from '../components/icons/SparklesIcon.tsx';
import { AVAILABLE_TEMPLATES } from '../constants.ts';
import { DownloadIcon } from '../components/icons/DownloadIcon.tsx';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon.tsx';
import { AbstractHeroPattern } from '../components/icons/AbstractHeroPattern.tsx';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon.tsx';
import { CreditCardIcon } from '../components/icons/CreditCardIcon.tsx';
import { PaletteIcon } from '../components/icons/PaletteIcon.tsx';
import { QuoteIcon } from '../components/icons/QuoteIcon.tsx';
import { StarIcon } from '../components/icons/StarIcon.tsx';

const { Link } = ReactRouterDOM;

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
  <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-purple-200/50 transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-start border border-slate-100 hover:border-purple-300">
    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-700 text-white rounded-2xl shadow-lg mb-6">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-slate-800 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

const FaqItem: React.FC<{ question: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ question, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:border-purple-200/80 transition-all duration-300">
            <button
                className="flex justify-between items-center w-full text-left"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span className="font-bold text-lg text-slate-800">{question}</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                  <ChevronDownIcon className="w-6 h-6 text-purple-500" />
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 pt-4' : 'max-h-0'}`}>
               <div className="text-slate-600 leading-relaxed">
                  {children}
               </div>
            </div>
        </div>
    );
};


const HomePage: React.FC = () => {
  return (
    <div className="space-y-24 sm:space-y-32 md:space-y-40">
      {/* Hero Section */}
      <section className="relative text-center py-20 sm:py-28 md:py-32 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl shadow-2xl overflow-hidden">
        <AbstractHeroPattern className="absolute inset-0 w-full h-full object-cover opacity-10 text-slate-700" />
        <div className="relative container mx-auto px-4 z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Craft Stunning Invoices, <span className="text-purple-300 block sm:inline">Effortlessly.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300/80 mb-10 max-w-2xl mx-auto">
            Invoice Maker blends beautiful design with powerful features to help you create professional invoices in record time.
          </p>
          <Link to="/create">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-xl transform hover:scale-105 !px-8 !py-3.5"
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
        <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4 inline-block">The Future of Invoicing is Here.</h2>
            <p className="text-lg text-slate-600 mb-12 sm:mb-16 max-w-2xl mx-auto">
                Discover features designed to save you time and impress your clients.
            </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            title="Easy Payments" 
            description="Generate UPI QR codes and payment links directly on your invoice. Get paid faster and easier." 
            icon={<CreditCardIcon className="w-7 h-7" />}
          />
          <FeatureCard 
            title="Exquisite Templates" 
            description="Choose from a curated collection of modern, classic, and creative templates to perfectly match your brand." 
            icon={<PaletteIcon className="w-7 h-7" />}
          />
          <FeatureCard 
            title="Seamless Experience" 
            description="Intuitive interface, easy customization, and quick PDF downloads. Share with a click." 
            icon={<DownloadIcon className="w-7 h-7" />}
          />
        </div>
      </section>
      
       {/* How It Works Section */}
      <section className="container mx-auto px-4 text-center py-20 bg-gradient-to-b from-white to-slate-100/60 rounded-3xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4 inline-block">Get Started in 3 Easy Steps</h2>
        <p className="text-lg text-slate-600 mb-16 max-w-xl mx-auto">From idea to paid invoice in minutes. It’s that simple.</p>
        <div className="relative mt-12 grid md:grid-cols-3 gap-8 text-left">
           {/* Dashed line connector for desktop */}
           <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-transparent">
               <svg width="100%" height="100%"><line x1="0" y1="50%" x2="100%" y2="50%" strokeWidth="2" strokeDasharray="8, 8" className="stroke-purple-400/50 -translate-y-12" /></svg>
           </div>
           
           <div className="relative bg-white p-8 rounded-2xl shadow-xl z-10 border border-slate-100 hover:border-purple-300 transition-all transform hover:-translate-y-2">
               <div className="flex items-center text-purple-600 font-bold mb-4"><span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 text-white font-black text-lg mr-4 shadow-lg">1</span> CHOOSE</div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">Select a Template</h3>
               <p className="text-slate-600">Pick a design that reflects your brand's personality from our diverse collection.</p>
           </div>
           <div className="relative bg-white p-8 rounded-2xl shadow-xl z-10 border border-slate-100 hover:border-purple-300 transition-all transform hover:-translate-y-2">
               <div className="flex items-center text-purple-600 font-bold mb-4"><span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 text-white font-black text-lg mr-4 shadow-lg">2</span> CUSTOMIZE</div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">Add Your Details</h3>
               <p className="text-slate-600">Fill in your items, client info, and payment details. Add your own branding.</p>
           </div>
           <div className="relative bg-white p-8 rounded-2xl shadow-xl z-10 border border-slate-100 hover:border-purple-300 transition-all transform hover:-translate-y-2">
               <div className="flex items-center text-purple-600 font-bold mb-4"><span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 text-white font-black text-lg mr-4 shadow-lg">3</span> SEND</div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">Share or Download</h3>
               <p className="text-slate-600">Send a link to your client or download a professional PDF in seconds.</p>
           </div>
        </div>
      </section>


      {/* Template Showcase Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4 inline-block">Find Your Perfect Look</h2>
         <p className="text-lg text-slate-600 text-center mb-12 sm:mb-16 max-w-xl mx-auto">
            Browse a few of our popular designs. More available inside!
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {AVAILABLE_TEMPLATES.slice(0, 3).map(template => (
            <div key={template.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col overflow-hidden border border-slate-100 hover:border-purple-200 transform hover:-translate-y-2">
              <div className="overflow-hidden">
                <img src={template.thumbnailUrl} alt={template.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"/>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{template.name}</h3>
                <p className="text-slate-600 text-sm mb-4 flex-grow leading-relaxed">{template.description}</p>
                <Link to="/create" state={{ initialTemplateId: template.id }} className="mt-auto block">
                  <Button variant="secondary" size="md" className="w-full !font-bold text-slate-700 bg-slate-100 border-slate-200 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-purple-700 group-hover:text-white group-hover:border-transparent transition-all duration-300">
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
                     <Button 
                        size="lg" 
                        variant="primary"
                        className="!px-10 !py-4 shadow-lg hover:shadow-xl transform hover:scale-105"
                     >
                        Explore All Templates & Create
                     </Button>
                </Link>
            </div>
        )}
      </section>

       {/* Testimonials Section */}
       <section className="bg-gradient-to-r from-purple-50 to-pink-50 py-20">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-12 inline-block">Loved by Freelancers & Businesses</h2>
                 <div className="grid md:grid-cols-3 gap-8 text-left">
                     <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border-t-4 border-purple-400">
                         <QuoteIcon className="w-10 h-10 text-purple-200 mb-4"/>
                         <p className="text-slate-600 mb-6 italic">"This is a game-changer! The templates are beautiful and my invoices have never looked better."</p>
                         <div className="flex items-center">
                            <img className="h-12 w-12 rounded-full mr-4" src="https://i.pravatar.cc/150?u=alex" alt="Alex R."/>
                            <div>
                                <p className="font-bold text-slate-800">Alex R.</p>
                                <p className="text-sm text-purple-600">Freelance Designer</p>
                                <div className="flex mt-1 text-yellow-400">{[...Array(5)].map((_,i) => <StarIcon key={i} className="w-4 h-4"/>)}</div>
                            </div>
                         </div>
                     </div>
                      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border-t-4 border-pink-400 transform md:scale-105">
                         <QuoteIcon className="w-10 h-10 text-pink-200 mb-4"/>
                         <p className="text-slate-600 mb-6 italic">"The templates are absolutely beautiful and so easy to customize. I finally feel proud sending invoices to my clients."</p>
                         <div className="flex items-center">
                            <img className="h-12 w-12 rounded-full mr-4" src="https://i.pravatar.cc/150?u=jenna" alt="Jenna M."/>
                            <div>
                                <p className="font-bold text-slate-800">Jenna M.</p>
                                <p className="text-sm text-pink-600">Marketing Consultant</p>
                                <div className="flex mt-1 text-yellow-400">{[...Array(5)].map((_,i) => <StarIcon key={i} className="w-4 h-4"/>)}</div>
                            </div>
                         </div>
                     </div>
                      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border-t-4 border-purple-400">
                         <QuoteIcon className="w-10 h-10 text-purple-200 mb-4"/>
                         <p className="text-slate-600 mb-6 italic">"Quick, intuitive, and the results are incredibly professional. The UPI payment option is a fantastic touch for my Indian clients."</p>
                         <div className="flex items-center">
                            <img className="h-12 w-12 rounded-full mr-4" src="https://i.pravatar.cc/150?u=sam" alt="Sam K."/>
                            <div>
                                <p className="font-bold text-slate-800">Sam K.</p>
                                <p className="text-sm text-purple-600">Web Developer</p>
                                <div className="flex mt-1 text-yellow-400">{[...Array(5)].map((_,i) => <StarIcon key={i} className="w-4 h-4"/>)}</div>
                            </div>
                         </div>
                     </div>
                 </div>
            </div>
       </section>

       {/* FAQ Section */}
       <section id="faq" className="container mx-auto px-4">
           <h2 className="text-3xl sm:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-12 inline-block">Frequently Asked Questions</h2>
           <div className="max-w-3xl mx-auto space-y-6">
                <FaqItem question="Is Invoice Maker really free?" defaultOpen={true}>
                    <p>Yes! Our free plan is perfect for those just starting out. It allows you to create up to 3 invoices per month and access basic templates. For unlimited invoices and premium features, you can upgrade to our Pro plan.</p>
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
            <div className="relative text-center py-16 sm:py-20 bg-gradient-to-r from-purple-400 to-purple-700 rounded-2xl shadow-2xl overflow-hidden">
                <AbstractHeroPattern className="absolute inset-0 w-full h-full object-cover opacity-10 text-white" />
                 <div className="relative z-10 text-white px-4">
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to Revolutionize Your Invoicing?</h2>
                    <p className="text-lg sm:text-xl mb-8 max-w-xl mx-auto opacity-90">Join thousands of professionals who are creating beautiful invoices in minutes.</p>
                    <Link to="/create">
                        <Button 
                            size="lg" 
                            className="bg-white text-purple-700 hover:bg-slate-100 font-bold !px-8 !py-3.5 shadow-lg hover:shadow-xl transform hover:scale-105"
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