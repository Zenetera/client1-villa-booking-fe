import { MOCK_VILLA } from '../../../mocks/villa';
import { HeroSection } from '../../../components/public/HeroSection';
import { SectionIntro } from '../../../components/public/SectionIntro';
import { VillaDetails } from '../../../components/public/VillaDetails';
import { ImageGallery } from '../../../components/public/ImageGallery';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <SectionIntro eyebrow="Your Retreat Awaits" heading="Plan Your Stay" />
      <VillaDetails villa={MOCK_VILLA} />
      <SectionIntro eyebrow="Every corner tells a story of Mediterranean luxury and comfort" heading="Explore the Villa" />
      <ImageGallery />
    </>
  );
}
