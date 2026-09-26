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
import { TrendingNowSection } from './TrendingNowSection';
import { SpecialOfferBanner } from './SpecialOfferBanner';
import { InstagramGallery } from './InstagramGallery';
import { Newsletter } from './Newsletter';
import { WhyShopWithUs } from './WhyShopWithUs';
import { CustomerReviews } from './CustomerReviews';

export const HomePage: React.FC = () => {
  const { homepageSections = [] } = useAdmin();

  const renderSectionComponent = (key: string) => {
    switch (key) {
      case 'brandHeader':
        return <BrandMarqueeHeader />;
      case 'categoryGrid':
        return <PrepaidTrustBanner />;
      case 'hero':
        return <HeroSection />;
      case 'artisanalPromises':
        return <ArtisanalPromises />;
      case 'comboOffers':
        return <FestiveComboOffers />;
      case 'dealOfTheDay':
        return <DealOfTheDaySection />;
      case 'newArrivals':
        return <NewArrivalsSection />;
      case 'bestSellers':
        return <BestSellersSection />;
      case 'trending':
        return <TrendingNowSection />;
      case 'festive':
        return <FestiveCollectionSection />;
      case 'specialOffer':
        return <SpecialOfferBanner />;
      case 'whyShop':
        return <WhyShopWithUs />;
      case 'reviews':
        return <CustomerReviews />;
      case 'instagram':
        return <InstagramGallery />;
      case 'newsletter':
        return <Newsletter />;
      default:
        return null;
    }
  };

  const visibleSections = [...homepageSections]
    .filter((section) => section.enabled !== false)
    .sort((first, second) => first.order - second.order);

  return (
    <div id="dynamic-storefront-homepage" className="flex flex-col relative gap-0">
      {visibleSections.map((section) => (
        <React.Fragment key={section.id}>
          {renderSectionComponent(section.key)}
        </React.Fragment>
      ))}
    </div>
  );
};
