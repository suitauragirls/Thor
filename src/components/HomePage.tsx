import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { BrandMarqueeHeader } from './BrandMarqueeHeader';
import { PrepaidTrustBanner } from './PrepaidTrustBanner';
import { HeroSection } from './HeroSection';
import { ArtisanalPromises } from './ArtisanalPromises';
import { FestiveComboOffers } from './FestiveComboOffers';
import { NewArrivalsSection } from './NewArrivalsSection';
import { DealOfTheDaySection } from './DealOfTheDaySection';
import { BestSellersSection, FestiveCollectionSection } from './BestSellersSection';
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
    !['hero', 'dealOfTheDay', 'categoryGrid', 'trending', 'specialOffer', 'instagram', 'newsletter', 'comboOffers'].includes(s.key)
  );

  const lowerSections = dynamicSections.length > 0
    ? dynamicSections.map(sec => renderSectionComponent(sec.key))
    : [
        <BestSellersSection key="bestSellers" />,
        <FestiveCollectionSection key="festive" />,
        <WhyShopWithUs key="whyShop" />,
        <CustomerReviews key="reviews" />,
      ];

  return (
    <div id="dynamic-storefront-homepage" className="flex flex-col relative gap-0">
      <BrandMarqueeHeader />
      <PrepaidTrustBanner />
      <HeroSection />
      <ArtisanalPromises />
      <FestiveComboOffers />
      <NewArrivalsSection />
      <DealOfTheDaySection />
      {lowerSections}
    </div>
  );
};
