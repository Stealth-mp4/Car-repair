import Hero from "@/components/sections/Hero";
import TeslaTeaser from "@/components/sections/TeslaTeaser";
import AboutTeaser from "@/components/sections/AboutTeaser";
import FeaturedServices from "@/components/sections/FeaturedServices";
import BrandsBand from "@/components/sections/BrandsBand";
import FeaturedBuilds from "@/components/sections/FeaturedBuilds";
import Reviews from "@/components/sections/Reviews";
import InstagramFeed from "@/components/sections/InstagramFeed";
import FinancingTeaser from "@/components/sections/FinancingTeaser";
import Process from "@/components/sections/Process";
import ContactCta from "@/components/sections/ContactCta";
import SitemapPreview from "@/components/sections/SitemapPreview";
import { builds } from "@/lib/builds";

/**
 * Homepage (V5) — a preview of the whole site: every major page gets a short,
 * visually distinct teaser + CTA into its dedicated route (see DESIGN.md
 * Layout). MaisonTrio, GalleryPreview, and Promotions are retired from this
 * assembly (superseded by AboutTeaser/FeaturedBuilds/FinancingTeaser+Process)
 * but kept in the tree, unused, per this repo's existing convention.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <TeslaTeaser />
      <AboutTeaser />
      <FeaturedServices />
      <BrandsBand />
      <FeaturedBuilds builds={builds} />
      <Reviews />
      <InstagramFeed />
      <FinancingTeaser />
      <Process />
      <ContactCta />
      <SitemapPreview />
    </>
  );
}
