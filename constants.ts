
import { InvoiceData, InvoiceTemplateInfo, InvoiceTemplateProps, PlanData, CustomizationState } from './types.ts';
import MinimalistTemplate from './features/invoice/templates/MinimalistTemplate.tsx';
import ModernTemplate from './features/invoice/templates/ModernTemplate.tsx';
import CreativeTemplate from './features/invoice/templates/CreativeTemplate.tsx';
import CorporateTemplate from './features/invoice/templates/CorporateTemplate.tsx';
import TechTemplate from './features/invoice/templates/TechTemplate.tsx';
import ElegantTemplate from './features/invoice/templates/ElegantTemplate.tsx';
import NatureHarmonyTemplate from './features/invoice/templates/NatureHarmonyTemplate.tsx';
import GeometricPulseTemplate from './features/invoice/templates/GeometricPulseTemplate.tsx';
import VintageScrollTemplate from './features/invoice/templates/VintageScrollTemplate.tsx';
import CosmicFlowTemplate from './features/invoice/templates/CosmicFlowTemplate.tsx';
import ArtDecoTemplate from './features/invoice/templates/ArtDecoTemplate.tsx';
import RusticCharmTemplate from './features/invoice/templates/RusticCharmTemplate.tsx';
import WatercolorWashTemplate from './features/invoice/templates/WatercolorWashTemplate.tsx';
import MonochromeFocusTemplate from './features/invoice/templates/MonochromeFocusTemplate.tsx';
import IndustrialGritTemplate from './features/invoice/templates/IndustrialGritTemplate.tsx';
import BohemianDreamTemplate from './features/invoice/templates/BohemianDreamTemplate.tsx';
import RetroPixelTemplate from './features/invoice/templates/RetroPixelTemplate.tsx';
import LuxuryGoldTemplate from './features/invoice/templates/LuxuryGoldTemplate.tsx';
import CustomTemplate from './features/invoice/templates/CustomTemplate.tsx';
import SwissModernTemplate from './features/invoice/templates/SwissModernTemplate.tsx';
import HandDrawnSketchTemplate from './features/invoice/templates/HandDrawnSketchTemplate.tsx';
import FloralBotanicalTemplate from './features/invoice/templates/FloralBotanicalTemplate.tsx';
import CyberpunkGlitchTemplate from './features/invoice/templates/CyberpunkGlitchTemplate.tsx';

// ADMIN_EMAIL is no longer used for client-side admin role simulation. Role is checked via user_metadata.
// export const ADMIN_EMAIL = 'admin@invoicemaker.linkfc.com'; 

export const DEFAULT_CURRENCY = 'USD';

export const PLANS_DATA: PlanData[] = [
  { 
    id: 'free_tier',
    name: 'Free', 
    price: '0', 
    price_suffix: '',
    billing_cycle: 'monthly',
    features: ['Up to 3 invoices per month', 'Basic templates', 'Email support', '"Powered by" branding'],
    cta_text: 'Current Plan',
    is_current: true, 
    variant: 'secondary',
    has_branding: true,
    sort_order: 1,
    invoice_limit: 3,
  },
  { 
    id: 'pro_monthly',
    name: 'Pro', 
    price: '15', 
    price_suffix: '/mo',
    billing_cycle: 'monthly',
    features: ['Unlimited invoices', 'All templates', 'Priority email support', 'Remove branding'],
    cta_text: 'Choose Pro',
    is_current: false,
    variant: 'primary',
    has_branding: false,
    sort_order: 2,
    invoice_limit: null,
  },
    { 
    id: 'pro_annually',
    name: 'Pro', 
    price: '144', 
    price_suffix: '/yr',
    billing_cycle: 'annually',
    features: ['Unlimited invoices', 'All templates', 'Priority email support', 'Remove branding'],
    cta_text: 'Choose Pro',
    is_current: false,
    variant: 'primary',
    has_branding: false,
    sort_order: 2,
    invoice_limit: null,
  },
  { 
    id: 'enterprise_monthly',
    name: 'Enterprise', 
    price: '49', 
    price_suffix: '/mo',
    billing_cycle: 'monthly',
    features: ['All Pro features', 'Team collaboration (soon)', 'Custom integrations (soon)', 'Dedicated support'],
    cta_text: 'Contact Us',
    is_current: false,
    variant: 'secondary',
    has_branding: false,
    sort_order: 3,
    invoice_limit: null,
  },
    { 
    id: 'enterprise_annually',
    name: 'Enterprise', 
    price: '470', 
    price_suffix: '/yr',
    billing_cycle: 'annually',
    features: ['All Pro features', 'Team collaboration (soon)', 'Custom integrations (soon)', 'Dedicated support'],
    cta_text: 'Contact Us',
    is_current: false,
    variant: 'secondary',
    has_branding: false,
    sort_order: 3,
    invoice_limit: null,
  },
];

export const INITIAL_CUSTOMIZATION_STATE: CustomizationState = {
  primaryColor: '#3B82F6',   // blue-500
  accentColor: '#10B981',    // emerald-500
  textColor: '#1E293B',      // slate-800
  backgroundColor: '#F8FAFC', // slate-50
  headingFont: 'Playfair Display',
  bodyFont: 'Lato',
  logoSize: 80,
  showLogo: true,
  showNotes: true,
  showTerms: true,
};

export const AVAILABLE_FONTS = [
  { family: 'Inter', label: 'Inter (Sans-Serif)' },
  { family: 'Playfair Display', label: 'Playfair Display (Serif)' },
  { family: 'Lato', label: 'Lato (Sans-Serif)' },
  { family: 'Lora', label: 'Lora (Serif)' },
  { family: 'Roboto Condensed', label: 'Roboto Condensed (Sans-Serif)' },
  { family: 'Quicksand', label: 'Quicksand (Sans-Serif)' },
  { family: 'Gochi Hand', label: 'Gochi Hand (Handwritten)' },
  { family: 'VT323', label: 'VT323 (Pixel)' },
  { family: 'Press Start 2P', label: 'Press Start 2P (Pixel)' },
  { family: 'Satisfy', label: 'Satisfy (Cursive)' },
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
  is_public: false,
  upiId: '',
  customization: INITIAL_CUSTOMIZATION_STATE,
  type: 'invoice',
  status: 'draft',
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
    thumbnailUrl: 'https://picsum.photos/seed/luxurygold/300/200',
  },
  {
    id: 'custom',
    name: 'Fully Customizable',
    description: 'A flexible template where you control the colors, fonts, and layout. Make it truly yours.',
    component: CustomTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/custom/300/200',
  },
  {
    id: 'swiss',
    name: 'Swiss Modern',
    description: 'Ultra-clean, minimalist design focusing on typography and whitespace for a sharp, professional look.',
    component: SwissModernTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/swiss/300/200',
  },
  {
    id: 'sketch',
    name: 'Hand-Drawn Sketch',
    description: 'Charming and friendly, uses handwritten fonts and doodle-like elements for a personal touch.',
    component: HandDrawnSketchTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/sketch/300/200',
  },
  {
    id: 'floral',
    name: 'Floral Botanical',
    description: 'Elegant and sophisticated, featuring delicate floral illustrations and graceful script fonts.',
    component: FloralBotanicalTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/floral/300/200',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Glitch',
    description: 'A futuristic, high-tech design with neon accents and a cool, retro-digital vibe.',
    component: CyberpunkGlitchTemplate as React.FC<InvoiceTemplateProps>,
    thumbnailUrl: 'https://picsum.photos/seed/cyberpunk/300/200',
  },
];
