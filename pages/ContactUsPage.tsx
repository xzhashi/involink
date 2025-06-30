import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button.tsx';
import Input from '../components/common/Input.tsx';
import Textarea from '../components/common/Textarea.tsx';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon.tsx';

const ContactUsPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        // Simulate a network request
        setTimeout(() => {
            // In a real app, you would send this data to a backend service.
            console.log({ name, email, subject, message });
            setStatus('sent');
            // Clear form after a delay
            setTimeout(() => {
                setName('');
                setEmail('');
                setSubject('');
                setMessage('');
                setStatus('idle');
            }, 3000);
        }, 1500);
    };


    return (
        <div className="py-12">
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-darkest">Get In Touch</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-DEFAULT">
                    Have a question, a suggestion, or need support? We're here to help.
                </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-start max-w-5xl mx-auto">
                {/* Contact Form */}
                <div className="bg-white p-8 rounded-xl shadow-2xl">
                    <h2 className="text-2xl font-bold text-neutral-darkest mb-6">Send us a Message</h2>
                    {status === 'sent' ? (
                         <div className="text-center p-6 bg-green-100 text-green-800 rounded-lg">
                            <h3 className="font-semibold text-lg">Thank You!</h3>
                            <p>Your message has been sent successfully. We'll get back to you soon.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Your Name"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={status === 'sending'}
                            />
                            <Input
                                label="Your Email"
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={status === 'sending'}
                            />
                            <Input
                                label="Subject"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                                disabled={status === 'sending'}
                            />
                            <Textarea
                                label="Message"
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                rows={5}
                                disabled={status === 'sending'}
                            />
                            <Button type="submit" variant="primary" className="w-full" disabled={status === 'sending'}>
                                {status === 'sending' ? 'Sending...' : 'Send Message'}
                            </Button>
                        </form>
                    )}
                </div>

                {/* Contact Info */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-xl shadow-2xl flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary-lightest text-primary-DEFAULT rounded-full flex items-center justify-center">
                            <EnvelopeIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-neutral-darkest">General Inquiries & Support</h3>
                            <p className="text-neutral-DEFAULT mt-1">For any questions about our service or if you need help.</p>
                            <a href="mailto:support@linkfc.com" className="mt-2 inline-block font-semibold text-primary-DEFAULT hover:text-primary-dark">
                                support@linkfc.com
                            </a>
                        </div>
                    </div>
                     <div className="bg-white p-8 rounded-xl shadow-2xl flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-secondary-light/20 text-secondary-DEFAULT rounded-full flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18V7.125C4.5 6.504 5.004 6 5.625 6H9" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-neutral-darkest">Frequently Asked Questions</h3>
                            <p className="text-neutral-DEFAULT mt-1">Find quick answers to common questions on our homepage.</p>
                             <a href="/#faq" className="mt-2 inline-block font-semibold text-secondary-DEFAULT hover:text-secondary-dark">
                                Go to FAQ
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUsPage;
