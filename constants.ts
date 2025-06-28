import { InvoiceData, InvoiceTemplateInfo, InvoiceTemplateProps, PlanData } from './types'; // Ensure InvoiceData and InvoiceTemplateProps are imported
import MinimalistTemplate from './features/invoice/templates/MinimalistTemplate';
import ModernTemplate from './features/invoice/templates/ModernTemplate';
import CreativeTemplate from './features/invoice/templates/CreativeTemplate';
import CorporateTemplate from './features/invoice/templates/CorporateTemplate';
import TechTemplate from './features/invoice/templates/TechTemplate';
import ElegantTemplate from './features/invoice/templates/ElegantTemplate';
import NatureHarmonyTemplate from './features/invoice/templates/NatureHarmonyTemplate';
import GeometricPulseTemplate from './features/invoice/templates/GeometricPulseTemplate';
import VintageScrollTemplate from './features/invoice/templates/VintageScrollTemplate';
import CosmicFlowTemplate from './features/invoice/templates/CosmicFlowTemplate';
import ArtDecoTemplate from './features/invoice/templates/ArtDecoTemplate';
import RusticCharmTemplate from './features/invoice/templates/RusticCharmTemplate';
import WatercolorWashTemplate from './features/invoice/templates/WatercolorWashTemplate';
import MonochromeFocusTemplate from './features/invoice/templates/MonochromeFocusTemplate';
import IndustrialGritTemplate from './features/invoice/templates/IndustrialGritTemplate';
import BohemianDreamTemplate from './features/invoice/templates/BohemianDreamTemplate';
import RetroPixelTemplate from './features/invoice/templates/RetroPixelTemplate';
import LuxuryGoldTemplate from './features/invoice/templates/LuxuryGoldTemplate';

// ADMIN_EMAIL is no longer used for client-side admin role simulation. Role is checked via user_metadata.
// export const ADMIN_EMAIL = 'admin@invoicemaker.linkfc.com'; 

export const DEFAULT_CURRENCY = 'USD';

// Note: Prices updated to INR for Razorpay integration
export const PLANS_DATA: PlanData[] = [
  { 
    id: 'free_tier',
    name: 'Free', 
    price: '0', 
    price_suffix: '',
    features: ['Up to 3 invoices per month', 'Basic templates', 'Email support', '"Powered by" branding'],
    cta_text: 'Current Plan',
    is_current: true, 
    variant: 'secondary',
    has_branding: true,
    sort_order: 1,
  },
  { 
    id: 'pro_tier',
    name: 'Pro', 
    price: '499', // Updated to INR
    price_suffix: '/mo',
    features: ['Unlimited invoices', 'All templates', 'AI suggestions', 'Priority email support', 'Remove branding'],
    cta_text: 'Choose Pro',
    is_current: false,
    variant: 'primary',
    has_branding: false,
    sort_order: 2,
  },
  { 
    id: 'enterprise_tier',
    name: 'Enterprise', 
    price: '1999', // Updated to INR
    price_suffix: '/mo',
    features: ['All Pro features', 'Team collaboration (soon)', 'Custom integrations (soon)', 'Dedicated support'],
    cta_text: 'Contact Us',
    is_current: false,
    variant: 'secondary',
    has_branding: false,
    sort_order: 3,
  },
];


export const INITIAL_INVOICE_STATE: InvoiceData = {
  id: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
  sender: { name: 'Your Company LLC', address: '123 Main St, Anytown, USA', email: 'your@company.com', phone: '555-1234', logoUrl: '' },
  recipient: { name: 'Client Company Inc.', address: '456 Client Ave, Otherville, USA', email: 'client@example.com', phone: '555-5678' },
  items: [{ id: crypto.randomUUID(), description: 'Sample Item or Service', quantity: 1, unitPrice: 100 }],
  notes: 'Thank you for your business!',
  terms: 'Payment due within 30 days.',
  taxRate: 0,
  discount: { type: 'percentage' as 'percentage' | 'fixed', value: 0 },
  currency: DEFAULT_CURRENCY,
  selectedTemplateId: 'modern', 
  manualPaymentLink: '', 
};

export const AVAILABLE_TEMPLATES: InvoiceTemplateInfo[] = [
  {
    id: 'modern',
    name: 'Modern Clean',
    description: 'A sleek and professional design with clear typography and primary color accents.',
    component: ModernTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/modern/300/200',
  },
  {
    id: 'minimalist',
    name: 'Classic Minimalist',
    description: 'A timeless, simple, and elegant black & white design focused on readability.',
    component: MinimalistTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/minimalist/300/200',
  },
  {
    id: 'creative',
    name: 'Creative Splash',
    description: 'A vibrant template with a touch of color, unique layout, and playful elements.',
    component: CreativeTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/creative/300/200',
  },
  {
    id: 'corporate',
    name: 'Corporate Blue',
    description: 'A professional and structured design with a corporate blue header and clear sections.',
    component: CorporateTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/corporateblue/300/200',
  },
  {
    id: 'tech',
    name: 'Tech Gradient',
    description: 'A modern, sleek design with gradient accents, suitable for tech-savvy businesses.',
    component: TechTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/techgradient/300/200',
  },
  {
    id: 'elegant',
    name: 'Elegant Serif',
    description: 'A refined and sophisticated layout with classic typography and a luxurious feel.',
    component: ElegantTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/elegantserif/300/200',
  },
  {
    id: 'natureharmony',
    name: "Nature's Harmony",
    description: 'A calm and organic design with earthy tones and a nature-inspired background.',
    component: NatureHarmonyTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/natureharmony/300/200',
  },
  {
    id: 'geometricpulse',
    name: 'Geometric Pulse',
    description: 'A bold and modern template featuring abstract geometric patterns and sharp lines.',
    component: GeometricPulseTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/geometricpulse/300/200',
  },
  {
    id: 'vintagescroll',
    name: 'Vintage Scroll',
    description: 'A classic template mimicking an old parchment with serif fonts and ornamental details.',
    component: VintageScrollTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/vintagescroll/300/200',
  },
  {
    id: 'cosmicflow',
    name: 'Cosmic Flow',
    description: 'A futuristic design with a dark, space-themed background and glowing accents.',
    component: CosmicFlowTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/cosmicflow/300/200',
  },
  {
    id: 'artdeco',
    name: 'Art Deco Elegance',
    description: 'Sophisticated geometric patterns with gold and black accents for a luxurious 1920s feel.',
    component: ArtDecoTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/artdeco/300/200',
  },
  {
    id: 'rusticcharm',
    name: 'Rustic Charm',
    description: 'Warm, earthy tones with textures like wood or burlap, and handwritten-style fonts.',
    component: RusticCharmTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/rusticcharm/300/200',
  },
  {
    id: 'watercolorwash',
    name: 'Watercolor Wash',
    description: 'Soft, blended watercolor backgrounds with light, airy typography for an artistic touch.',
    component: WatercolorWashTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/watercolor/300/200',
  },
  {
    id: 'monochromefocus',
    name: 'Monochrome Focus',
    description: 'A stark and impactful black and white design, optionally with a single bold accent color.',
    component: MonochromeFocusTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/monochrome/300/200',
  },
  {
    id: 'industrialgrit',
    name: 'Industrial Grit',
    description: 'Dark grays, metallic textures (simulated), and strong block or stencil fonts.',
    component: IndustrialGritTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/industrial/300/200',
  },
  {
    id: 'bohemiandream',
    name: 'Bohemian Dream',
    description: 'Earthy tones, floral or paisley motifs, and flowing script fonts for a free-spirited vibe.',
    component: BohemianDreamTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/bohemian/300/200',
  },
  {
    id: 'retropixel',
    name: 'Retro Pixel Gamer',
    description: '8-bit pixel art elements, classic video game fonts, and bright, contrasting colors.',
    component: RetroPixelTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/retropixel/300/200',
  },
  {
    id: 'luxurygold',
    name: 'Luxury Gold Leaf',
    description: 'Deep, rich backgrounds (black, navy) with elegant gold foil-like accents and serif fonts.',
    component: LuxuryGoldTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/luxurygold/300/200'
  } 
];