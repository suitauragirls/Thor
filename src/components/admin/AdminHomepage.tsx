import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableHomepageSection } from './SortableHomepageSection';
import { 
  Eye, 
  EyeOff, 
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  Flame,
  LayoutGrid,
  TrendingUp,
  Award,
  Gift,
  ShieldCheck,
  Star,
  RotateCcw,
  Sliders,
  ChevronRight,
  Check
} from 'lucide-react';
import { AdminTab } from '../../types';

export const AdminHomepage: React.FC = () => {
  const { 
    homepageSections = [], 
    toggleHomepageSection, 
    moveHomepageSection,
    reorderHomepageSections,
    resetHomepageSectionsToDefault,
    setAdminTab
  } = useAdmin();
  const { showToast, setActivePage } = useShop();
  const [isResetting, setIsResetting] = useState(false);

  const getSectionIcon = (key: string) => {
    switch (key) {
      case 'hero':
        return <Sparkles className="w-4 h-4 text-black" />;
      case 'comboOffers':
      case 'dealOfTheDay':
        return <Gift className="w-4 h-4 text-black" />;
      case 'categoryGrid':
        return <LayoutGrid className="w-4 h-4 text-purple-500" />;
      case 'brandHeader':
        return <Sparkles className="w-4 h-4 text-black" />;
      case 'artisanalPromises':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'specialOffer':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'instagram':
      case 'newsletter':
        return <Star className="w-4 h-4 text-black" />;
      case 'newArrivals':
        return <Sparkles className="w-4 h-4 text-\[#B76E79\]" />;
      case 'bestSellers':
        return <Award className="w-4 h-4 text-black" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4 text-cyan-600" />;
      case 'festive':
        return <Gift className="w-4 h-4 text-emerald-600" />;
      case 'whyShop':
        return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
      case 'reviews':
        return <Star className="w-4 h-4 text-black fill-black" />;
      default:
        return <Layers className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSectionDescription = (key: string) => {
    switch (key) {
      case 'hero':
        return 'Square 1:1 luxury showcase slider with direct Buy Now actions.';
      case 'dealOfTheDay':
        return 'Promotional Limited-Time Product Spotlight & Countdown Timer for Meta/Instagram Ads.';
      case 'comboOffers':
        return 'Royal Multi-Buy Combo Offer Builder (Buy 2 Suits Get Extra 15% OFF).';
      case 'categoryGrid':
        return 'Visual image grid linking to Suits, Kurtis, Anarkali & Dresses.';
      case 'brandHeader':
        return 'Announcement ticker and brand messages at the top of the storefront.';
      case 'artisanalPromises':
        return 'Shipping, craftsmanship, exchange, and payment trust promises.';
      case 'specialOffer':
        return 'Promotional campaign banner controlled from Banner Management.';
      case 'instagram':
        return 'Social media lookbook gallery.';
      case 'newsletter':
        return 'Customer newsletter signup form.';
      case 'newArrivals':
        return 'Latest catalog additions with fresh tags and quick view.';
      case 'bestSellers':
        return 'Top customer-favorite suits and bestselling ensembles.';
      case 'trending':
        return 'High-engagement viral styles and trending collections.';
      case 'festive':
        return 'Royal festive edit for weddings and special celebrations.';
      case 'whyShop':
        return 'Four core trust pillars: Express Shipping, Pure Fabric, Easy Exchanges, 100% Prepaid.';
      case 'reviews':
        return 'Verified customer ratings, feedback, and photo reviews carousel.';
      default:
        return 'Storefront content module.';
    }
  };

  const getSectionAdminShortcut = (key: string): { label: string; tab: AdminTab } | null => {
    switch (key) {
      case 'hero':
        return { label: 'Edit Slides', tab: 'hero' };
      case 'dealOfTheDay':
        return { label: 'Edit Deal', tab: 'dealOfTheDay' as AdminTab };
      case 'comboOffers':
        return { label: 'Edit Combo', tab: 'comboOffers' as AdminTab };
      case 'specialOffer':
        return { label: 'Edit Banner', tab: 'banners' };
      case 'reviews':
        return { label: 'Manage Reviews', tab: 'reviews' };
      default:
        return null;
    }
  };

  const moveToExtreme = async (index: number, position: 'top' | 'bottom') => {
    const list = [...homepageSections];
    const item = list.splice(index, 1)[0];
    if (position === 'top') {
      list.unshift(item);
    } else {
      list.push(item);
    }
    await reorderHomepageSections(list);
    showToast(`Moved "${item.title}" to ${position}.`, 'info');
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset homepage sections to default order and enable all sections?')) {
      setIsResetting(true);
      try {
        await resetHomepageSectionsToDefault();
        showToast('Homepage layout reset to the default order.', 'success');
      } catch (e) {
        console.error(e);
        showToast('Error resetting layout', 'error');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const enabledCount = homepageSections.filter(s => s.enabled !== false).length;
  const disabledCount = homepageSections.length - enabledCount;

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = homepageSections.findIndex((item) => item.id === active.id);
      const newIndex = homepageSections.findIndex((item) => item.id === over.id);
      const newSections = arrayMove(homepageSections, oldIndex, newIndex);
      await reorderHomepageSections(newSections);
      showToast('Homepage layout reordered!', 'success');
    }
  };

  return (
    <div id="admin-homepage-page" className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-\[#FAF7F2\] p-5 rounded-2xl border border-rose-100 shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B2635]">
            Storefront Layout Customization
          </span>
          <h2 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2 mt-0.5">
            <Layers className="w-6 h-6 text-black" />
            Homepage Layout & Section Order Manager
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Is admin controls ki help se homepage ke visible sections ko hide/show ya reorder karke live storefront layout badlo.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isResetting}
            className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Reset to default order"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Default Order</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePage('home')}
            className="px-4 py-2 bg-gradient-to-r from-[#241D1B] to-[#241D1B] hover:brightness-110 text-[#211C1A] rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Live Store</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-rose-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 font-medium">Total Sections</span>
            <div className="text-xl font-bold text-gray-900">{homepageSections.length}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#D8C8B8]/20 text-[#211C1A] flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-emerald-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 font-medium">Active (Visible on Home)</span>
            <div className="text-xl font-bold text-emerald-600">{homepageSections.filter(s => s.enabled !== false).length}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Eye className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 font-medium">Hidden Sections</span>
            <div className="text-xl font-bold text-gray-400">{homepageSections.filter(s => s.enabled === false).length}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center font-bold">
            <EyeOff className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Section Order Cards */}
      <div className="bg-\[#FAF7F2\] p-5 sm:p-6 rounded-2xl border border-rose-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="font-serif text-base font-bold text-gray-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#211C1A]" />
              Storefront Sections Hierarchy
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Top to bottom order matches exactly how visitors see the homepage.
            </p>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Preview Updated</span>
          </div>
        </div>

        {/* List of Sections */}
        <div className="space-y-2.5">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={homepageSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {homepageSections.map((sec, index) => (
                <SortableHomepageSection
                  key={sec.id}
                  sec={sec}
                  index={index}
                  shortcut={getSectionAdminShortcut(sec.key)}
                  isEnabled={sec.enabled !== false}
                  getSectionIcon={getSectionIcon}
                  getSectionDescription={getSectionDescription}
                  setAdminTab={setAdminTab}
                  toggleHomepageSection={toggleHomepageSection}
                  showToast={showToast}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* Live sync helper box */}
        <div className="p-4 bg-gradient-to-r from-[#D8C8B8]/60 via-amber-50/40 to-\[#D8C8B8\]\/60 rounded-2xl border border-rose-100 text-xs text-gray-700 flex items-start gap-3 mt-4">
          <Sparkles className="w-4 h-4 text-black shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[#211C1A]">Homepage Preview Controls:</span>
            <p className="text-gray-600 text-[11px]">
              Changes apply immediately in this browser and are stored locally. Shared publishing across devices requires secure server-side configuration.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
