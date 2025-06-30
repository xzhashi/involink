import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { InvoiceData } from '../types.ts';
import { fetchPublicInvoiceByIdFromSupabase } from '../services/supabaseClient.ts';
import InvoicePreview from '../features/invoice/InvoicePreview.tsx';
import Button from '../components/common/Button.tsx';
import { DownloadIcon } from '../components/icons/DownloadIcon.tsx';
import { SparklesIcon } from '../components/icons/SparklesIcon.tsx';

const PublicInvoicePage: React.FC = () => {
    const { invoiceDbId } = useParams<{ invoiceDbId: string }>();
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // This page should not have the main navbar/footer, so we hide them by adding a class to the body.
        document.body.classList.add('bg-neutral-lightest');
        const mainNavbar = document.querySelector('nav');
        const mainFooter = document.querySelector('footer');
        if (mainNavbar) mainNavbar.style.display = 'none';
        if (mainFooter) mainFooter.style.display = 'none';
        
        return () => {
            document.body.classList.remove('bg-neutral-lightest');
            if (mainNavbar) mainNavbar.style.display = '';
            if (mainFooter) mainFooter.style.display = '';
        };
    }, []);

    useEffect(() => {
        if (!invoiceDbId) {
            setError("No invoice ID provided.");
            setLoading(false);
            return;
        }

        const loadInvoice = async () => {
            try {
                const data = await fetchPublicInvoiceByIdFromSupabase(invoiceDbId);
                if (data) {
                    setInvoice(data);
                } else {
                    setError("Invoice not found or you do not have permission to view it.");
                }
            } catch (err: any) {
                setError("An error occurred while fetching the invoice.");
            } finally {
                setLoading(false);
            }
        };

        loadInvoice();
    }, [invoiceDbId]);

    const handleDownload = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <SparklesIcon className="w-12 h-12 text-primary-DEFAULT animate-spin mx-auto" />
                    <p className="mt-2 text-neutral-DEFAULT">Loading Invoice...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-lg mx-4">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-neutral-dark">{error}</p>
                    <Link to="/">
                        <Button variant="primary" className="mt-6">Go to Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <header className="bg-white shadow-md p-4 flex justify-between items-center no-print sticky top-0 z-10">
                <Link to="/" className="flex items-center text-primary-dark hover:text-primary-DEFAULT transition-colors">
                    <SparklesIcon className="h-8 w-8 mr-2" />
                    <span className="font-bold text-xl">Invoice Maker</span>
                </Link>
                <Button onClick={handleDownload} leftIcon={<DownloadIcon className="w-5 h-5"/>}>
                    Download PDF
                </Button>
            </header>
            <main className="p-4 sm:p-8">
                {invoice && <InvoicePreview invoice={invoice} />}
            </main>
             <footer className="text-center py-6 no-print">
                <p className="text-sm text-neutral-DEFAULT">
                    Create your own beautiful invoices. <Link to="/" className="text-primary-DEFAULT hover:underline font-semibold">Get Started with Invoice Maker</Link>
                </p>
            </footer>
        </div>
    );
};

export default PublicInvoicePage;
