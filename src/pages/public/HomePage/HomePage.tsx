import { MOCK_VILLA } from '../../../mocks/villa';
import { HeroSection } from '../../../components/public/HeroSection';
import { VillaIntro } from '../../../components/public/VillaIntro';
import { VillaDetails } from '../../../components/public/VillaDetails';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <VillaIntro eyebrow="Your Retreat Awaits" heading="Plan Your Stay" />
      <VillaDetails villa={MOCK_VILLA} />
    </>
  );
}
