import Hero from "@/components/sections/Hero";
import TeslaTeaser from "@/components/sections/TeslaTeaser";
import MaisonTrio from "@/components/sections/MaisonTrio";
import Reviews from "@/components/sections/Reviews";
import FeaturedServices from "@/components/sections/FeaturedServices";
import GalleryPreview from "@/components/sections/GalleryPreview";
import Promotions from "@/components/sections/Promotions";
import InstagramFeed from "@/components/sections/InstagramFeed";
import { builds } from "@/lib/builds";

export default function Home() {
  return (
    <>
      <Hero />
      <TeslaTeaser />
      <MaisonTrio />
      <Reviews />
      <FeaturedServices />
      <GalleryPreview builds={builds} />
      <Promotions />
      <InstagramFeed />
    </>
  );
}
