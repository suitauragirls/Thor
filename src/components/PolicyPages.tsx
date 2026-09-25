import React from 'react';
import { useShop } from '../context/ShopContext';
import { Truck, RotateCcw, ShieldCheck, FileText, Ban, Ruler, ChevronRight, Check } from 'lucide-react';

interface PolicyWrapperProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const PolicyWrapper: React.FC<PolicyWrapperProps> = ({ title, subtitle, icon, children }) => {
  const { setActivePage } = useShop();

  return (
    <div className="py-12 sm:py-16 bg-[#FFFDFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500">
          <button onClick={() => setActivePage('home')} className="hover:text-[#58152D]">Home</button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[#58152D] font-bold">{title}</span>
        </nav>

        <div className="border-b border-rose-100 pb-6 flex items-start gap-4">
          <div className="p-3 bg-[#E0BFB8]/20 rounded-2xl text-[#58152D] shrink-0 border border-rose-200">
            {icon}
          </div>
          <div>
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#B88E28]">
              Suit Bliss Aura Policy
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C1820] mt-1">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="bg-\[#FAF7F5\] border border-rose-100 rounded-2xl p-6 sm:p-10 shadow-xs prose prose-rose max-w-none text-xs sm:text-sm text-gray-700 leading-relaxed space-y-6">
          {children}
        </div>

      </div>
    </div>
  );
};

export const ShippingPolicyPage: React.FC = () => (
  <PolicyWrapper
    title="Shipping & Delivery Policy"
    subtitle="Fast, insured, pan-India express prepaid shipping"
    icon={<Truck className="w-8 h-8" />}
  >
    <div className="space-y-4">
      <h3 className="font-serif text-xl font-bold text-[#58152D]">1. Pan-India Delivery Coverage</h3>
      <p>
        Suit Bliss Aura delivers to over 26,000+ pin codes across all states and union territories in India via trusted tier-1 logistics partners including BlueDart Air, Delhivery VIP, and DTDC Express.
      </p>

      <h3 className="font-serif text-xl font-bold text-[#58152D]">2. Shipping Charges</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Standard Shipping:</strong> Zero shipping charges! Complimentary Free Express Shipping is automatically applied to all orders nationwide.</li>
      </ul>

      <h3 className="font-serif text-xl font-bold text-[#58152D]">3. Order Processing & Dispatch Timelines</h3>
      <p>
        Since all orders are prepaid, your parcel enters priority packing immediately. Most orders are dispatched within <strong>24 to 48 business hours</strong> from our central Jaipur atelier.
      </p>

      <h3 className="font-serif text-xl font-bold text-[#58152D]">4. Estimated Delivery Days</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Metro Cities (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata):</strong> 2 to 4 business days.</li>
        <li><strong>Rest of India (Tier 2 & Tier 3 cities):</strong> 3 to 6 business days.</li>
        <li><strong>Northeast & Remote Locations:</strong> 5 to 7 business days.</li>
      </ul>

      <h3 className="font-serif text-xl font-bold text-[#58152D]">5. Real-Time Tracking</h3>
      <p>
        As soon as your parcel is dispatched, a live tracking link with an AWB number is sent to your registered email and WhatsApp number. You can also track your parcel anytime on our website via the <strong>Track Order</strong> page.
      </p>
    </div>
  </PolicyWrapper>
);

export const ReturnPolicyPage: React.FC = () => (
  <PolicyWrapper
    title="Returns & Exchanges Policy"
    subtitle="7-day hassle-free exchange and return commitment"
    icon={<RotateCcw className="w-8 h-8" />}
  >
    <div className="space-y-4">
      <h3 className="font-serif text-xl font-bold text-[#58152D]">1. 7-Day Easy Return / Exchange Window</h3>
      <p>
        We want you to fall in love with your Suit Bliss Aura ensemble. If the size does not fit or if you wish to exchange it for another design, you may request an exchange or return within <strong>7 days of delivery</strong>.
      </p>

      <h3 className="font-serif text-xl font-bold text-[#58152D]">2. Eligibility Conditions</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>The garment must be unused, unwashed, and unstained.</li>
        <li>All original brand tags, labels, and packaging must be intact.</li>
        <li>Items purchased on Final Clearance (50%+ off) are eligible for size exchange only.</li>
      </ul>

      <h3 className="font-serif text-xl font-bold text-[#58152D]">3. Reverse Pickup Process</h3>
      <p>
        Our logistics team will arrange a complimentary doorstep pickup from your address within 24-48 hours of your request.
      </p>

      <h3 className="font-serif text-xl font-bold text-[#58152D]">4. Fast Refund / Store Credit</h3>
      <p>
        Once the item passes our quick quality check at our warehouse, your refund is credited to your original payment method (or issued as store credit) within 3 to 5 business days.
      </p>
    </div>
  </PolicyWrapper>
);

export const PrivacyPolicyPage: React.FC = () => (
  <PolicyWrapper
    title="Privacy Policy"
    subtitle="How we safeguard your personal data and digital privacy"
    icon={<ShieldCheck className="w-8 h-8" />}
  >
    <div className="space-y-4">
      <h3 className="font-serif text-xl font-bold text-[#58152D]">1. Information We Collect</h3>
      <p>
        We collect personal information that you provide when placing an order, creating an account, or subscribing to our newsletter (such as your Name, Phone Number, Email, and Delivery Address).
      </p>

      <h3 className="font-serif text-xl font-bold text-[#58152D]">2. 256-Bit Payment Encryption</h3>
      <p>
        We never store credit card numbers, UPI PINs, or net banking credentials on our servers. All financial transactions are processed through RBI-compliant 256-bit encrypted payment gateways.
      </p>

      <h3 className="font-serif text-xl font-bold text-[#58152D]">3. No Selling of Customer Data</h3>
      <p>
        Suit Bliss Aura will NEVER sell, lease, or rent your personal contact information to any third-party marketing companies. Your data is used strictly for fulfilling orders and communicating updates.
      </p>
    </div>
  </PolicyWrapper>
);

export const TermsPage: React.FC = () => (
  <PolicyWrapper
    title="Terms & Conditions"
    subtitle="Standard terms governing use of Suit Bliss Aura digital platform"
    icon={<FileText className="w-8 h-8" />}
  >
    <div className="space-y-4">
      <h3 className="font-serif text-xl font-bold text-[#58152D]">1. General Store Terms</h3>
      <p>
        By accessing and placing orders on Suit Bliss Aura, you agree to abide by our terms of service, pricing guidelines, and prepaid store policies.
      </p>

      <h3 className="font-serif text-xl font-bold text-[#58152D]">2. Color Accuracy & Handcrafted Variations</h3>
      <p>
        Because our ensembles feature natural dyes, hand-block printing, and artisanal zardozi embroidery, subtle handcrafted variations in stitch alignment or hue are natural hallmarks of authentic ethnic tailoring.
      </p>

      <h3 className="font-serif text-xl font-bold text-[#58152D]">3. Pricing & Intellectual Property</h3>
      <p>
        All prices are listed in Indian Rupees (INR) and are inclusive of GST. All photographs, lookbooks, slogans ("Elegance That Feels Like You"), and designs are the intellectual property of Suit Bliss Aura.
      </p>
    </div>
  </PolicyWrapper>
);

export const CancellationPolicyPage: React.FC = () => (
  <PolicyWrapper
    title="Cancellation Policy"
    subtitle="Guidelines for cancelling or modifying an un-dispatched order"
    icon={<Ban className="w-8 h-8" />}
  >
    <div className="space-y-4">
      <h3 className="font-serif text-xl font-bold text-[#58152D]">1. Cancellation Window</h3>
      <p>
        You can cancel your order free of cost at any time <strong>before it is dispatched</strong> (typically within 12 hours of placing the order).
      </p>

      <h3 className="font-serif text-xl font-bold text-[#58152D]">2. How to Request Cancellation</h3>
      <p>
        To cancel an order, simply email <strong>suitblissaura@gmail.com</strong> or WhatsApp our support team (+91 82384 51017) with your Order ID.
      </p>

      <h3 className="font-serif text-xl font-bold text-[#58152D]">3. 100% Instant Refund for Cancelled Orders</h3>
      <p>
        For orders cancelled prior to dispatch, the full 100% prepaid amount is refunded directly back to your source account within 24 to 48 banking hours.
      </p>
    </div>
  </PolicyWrapper>
);

export const SizeGuidePage: React.FC = () => (
  <PolicyWrapper
    title="Comprehensive Size Guide"
    subtitle="Garment body measurements in inches and standard Indian size conversions"
    icon={<Ruler className="w-8 h-8" />}
  >
    <div className="space-y-6">
      <p>
        To find your flawless silhouette, measure yourself with a flexible tape over your undergarments. If your measurements fall between two sizes, we recommend choosing the larger size for a relaxed, comfortable ethnic drape.
      </p>

      <div className="overflow-x-auto border border-rose-100 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#58152D] text-white font-serif text-xs uppercase tracking-wider">
              <th className="p-3 border-b border-rose-900">Brand Size</th>
              <th className="p-3 border-b border-rose-900">Bust (Inches)</th>
              <th className="p-3 border-b border-rose-900">Waist (Inches)</th>
              <th className="p-3 border-b border-rose-900">Hip (Inches)</th>
              <th className="p-3 border-b border-rose-900">Kurta Length</th>
              <th className="p-3 border-b border-rose-900">Bottom Length</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-50">
            <tr className="hover:bg-[#E0BFB8]/40">
              <td className="p-3 font-bold text-[#58152D]">XS (34)</td>
              <td className="p-3">34"</td>
              <td className="p-3">28"</td>
              <td className="p-3">36"</td>
              <td className="p-3">44"</td>
              <td className="p-3">38"</td>
            </tr>
            <tr className="hover:bg-[#E0BFB8]/40 bg-[#E0BFB8]/20">
              <td className="p-3 font-bold text-[#58152D]">S (36)</td>
              <td className="p-3">36"</td>
              <td className="p-3">30"</td>
              <td className="p-3">38"</td>
              <td className="p-3">44"</td>
              <td className="p-3">38"</td>
            </tr>
            <tr className="hover:bg-[#E0BFB8]/40">
              <td className="p-3 font-bold text-[#58152D]">M (38)</td>
              <td className="p-3">38"</td>
              <td className="p-3">32"</td>
              <td className="p-3">40"</td>
              <td className="p-3">45"</td>
              <td className="p-3">38.5"</td>
            </tr>
            <tr className="hover:bg-[#E0BFB8]/40 bg-[#E0BFB8]/20">
              <td className="p-3 font-bold text-[#58152D]">L (40)</td>
              <td className="p-3">40"</td>
              <td className="p-3">34"</td>
              <td className="p-3">42"</td>
              <td className="p-3">45"</td>
              <td className="p-3">39"</td>
            </tr>
            <tr className="hover:bg-[#E0BFB8]/40">
              <td className="p-3 font-bold text-[#58152D]">XL (42)</td>
              <td className="p-3">42"</td>
              <td className="p-3">36"</td>
              <td className="p-3">44"</td>
              <td className="p-3">46"</td>
              <td className="p-3">39"</td>
            </tr>
            <tr className="hover:bg-[#E0BFB8]/40 bg-[#E0BFB8]/20">
              <td className="p-3 font-bold text-[#58152D]">XXL (44)</td>
              <td className="p-3">44"</td>
              <td className="p-3">38"</td>
              <td className="p-3">46"</td>
              <td className="p-3">46"</td>
              <td className="p-3">39.5"</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-[#E0BFB8]/50 rounded-xl border border-rose-100 text-xs space-y-2">
        <h4 className="font-bold text-[#58152D]">How To Measure Correctly:</h4>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li><strong>Bust:</strong> Measure around the fullest part of your chest, keeping the tape comfortably horizontal.</li>
          <li><strong>Waist:</strong> Measure around your natural waistline, typically an inch above the belly button.</li>
          <li><strong>Hips:</strong> Measure around the fullest part of your hips and seat area.</li>
        </ul>
      </div>
    </div>
  </PolicyWrapper>
);
