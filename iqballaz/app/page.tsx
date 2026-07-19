import Hero from "@/components/sections/Hero";
import FeaturedServices from "@/components/sections/FeaturedServices";
import Promotions from "@/components/sections/Promotions";
import TeslaTeaser from "@/components/sections/TeslaTeaser";
import GalleryPreview from "@/components/sections/GalleryPreview";
import Reviews from "@/components/sections/Reviews";
import InstagramFeed from "@/components/sections/InstagramFeed";
import FinancingTeaser from "@/components/sections/FinancingTeaser";
import CtaBand from "@/components/sections/CtaBand";
import { builds } from "@/lib/builds";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedServices />
      <Promotions />
      <TeslaTeaser />
      <GalleryPreview builds={builds} />
      <Reviews />
      <InstagramFeed />
      <FinancingTeaser />
      <CtaBand />
    </>
  );
}
