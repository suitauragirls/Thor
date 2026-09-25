import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { BrandMarqueeHeader } from './BrandMarqueeHeader';
import { HeroSection } from './HeroSection';
import { PrepaidTrustBanner } from './PrepaidTrustBanner';
import { ArtisanalPromises } from './ArtisanalPromises';
import { DealOfTheDaySection } from './DealOfTheDaySection';
import { CategoryGrid } from './CategoryGrid';
import { NewArrivalsSection } from './NewArrivalsSection';
import { BestSellersSection, FestiveCollectionSection } from './BestSellersSection';
import { TrendingNowSection } from './TrendingNowSection';
import { WhyShopWithUs } from './WhyShopWithUs';
import { CustomerReviews } from './CustomerReviews';

export const HomePage: React.FC = () => {
  const { homepageSections = [] } = useAdmin();

  // Render non-hero dynamic components
  const renderSectionComponent = (key: string) => {
    switch (key) {
      case 'newArrivals':
        return <NewArrivalsSection key="newArrivals" />;
      case 'bestSellers':
        return <BestSellersSection key="bestSellers" />;
      case 'trending':
        return <TrendingNowSection key="trending" />;
      case 'festive':
        return <FestiveCollectionSection key="festive" />;
      case 'whyShop':
        return <WhyShopWithUs key="whyShop" />;
      case 'reviews':
        return <CustomerReviews key="reviews" />;
      default:
        return null;
    }
  };

  // Filter dynamic sections (excluding fixed top hero & deal sections)
  const dynamicSections = homepageSections.filter(s => 
    s.enabled !== false && 
    !['hero', 'dealOfTheDay', 'categoryGrid', 'specialOffer', 'instagram', 'newsletter', 'comboOffers'].includes(s.key)
  );

  return (
    <div id="dynamic-storefront-homepage" className="flex flex-col relative gap-0">

      {/* TOP FIXED HERO & SLIDER GROUP */}
      <BrandMarqueeHeader />
      <PrepaidTrustBanner />
      <HeroSection />
      <ArtisanalPromises />

      {/* DEAL OF THE DAY - EXACTLY BELOW HERO SLIDES */}
      <DealOfTheDaySection />

      {/* DYNAMIC LOWER CATALOG SECTIONS */}
      {dynamicSections.length > 0 ? (
        dynamicSections.map(sec => renderSectionComponent(sec.key))
      ) : (
        <>
          <NewArrivalsSection />
          <BestSellersSection />
          <TrendingNowSection />
          <FestiveCollectionSection />
          <WhyShopWithUs />
          <CustomerReviews />
        </>
      )}

    </div>
  );
};
