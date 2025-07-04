import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../components/common/Button.tsx';
import { SparklesIcon } from '../components/icons/SparklesIcon.tsx';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon.tsx';
import { UsersIcon } from '../components/icons/UsersIcon.tsx';

const { Link } = ReactRouterDOM;

const ValueCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-primary-lightest text-primary-DEFAULT rounded-full flex items-center justify-center">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-semibold text-neutral-darkest mb-2">{title}</h3>
            <p className="text-neutral-DEFAULT leading-relaxed">{description}</p>
        </div>
    </div>
);

const AboutUsPage: React.FC = () => {
    return (
        <div className="space-y-16 py-8">
            {/* Hero Section */}
            <section className="text-center">
                <SparklesIcon className="mx-auto h-16 w-16 text-accent-DEFAULT" />
                <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-neutral-darkest leading-tight">
                    Making Invoicing Simple & Beautiful
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-neutral-DEFAULT">
                    At Invoice Maker by LinkFC, we believe that billing shouldn't be a chore. It should be a seamless, professional, and even delightful part of your business workflow. We're here to make that a reality.
                </p>
            </section>

            {/* Our Mission Section */}
            <section className="container mx-auto px-4 max-w-4xl text-center bg-white p-12 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-bold text-primary-dark mb-4">Our Mission</h2>
                <p className="text-neutral-dark text-lg">
                    To empower freelancers, small businesses, and entrepreneurs with an intuitive, powerful, and aesthetically pleasing invoicing tool. We want to help you get paid faster, look more professional, and spend less time on paperwork and more time doing what you love.
                </p>
            </section>

            {/* Our Values Section */}
            <section className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-neutral-darkest mb-12">What We Stand For</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <ValueCard
                        title="Elegant Design"
                        description="First impressions matter. Our templates are designed to be modern, clean, and professional, ensuring you always look your best."
                        icon={<CheckCircleIcon className="w-6 h-6" />}
                    />
                    <ValueCard
                        title="User-Centric Simplicity"
                        description="We obsess over the user experience. Our tool is intuitive and easy to use, requiring no technical skills or lengthy tutorials."
                        icon={<UsersIcon className="w-6 h-6" />}
                    />
                    <ValueCard
                        title="Powerful Features"
                        description="From UPI/QR payments to beautiful templates and easy sharing, we provide the features you need to streamline your billing process."
                        icon={<SparklesIcon className="w-6 h-6" />}
                    />
                </div>
            </section>
            
            {/* Final CTA */}
            <section className="text-center py-16 bg-neutral-lightest rounded-lg">
                 <h2 className="text-3xl font-bold text-neutral-darkest mb-4">Ready to Join Us?</h2>
                <p className="text-lg text-neutral-DEFAULT mb-8 max-w-xl mx-auto">
                    Experience the future of invoicing today. It’s free to get started.
                </p>
                <Link to="/create">
                    <Button size="lg" variant="primary">
                        Create Your First Invoice
                    </Button>
                </Link>
            </section>
        </div>
    );
};

export default AboutUsPage;