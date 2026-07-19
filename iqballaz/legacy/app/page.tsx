import Hero from "@/components/Hero";
import Location from "@/components/Location";
import Services from "@/components/Services";
import Testimonial from "@/components/Testimonial";
import Whyus from "@/components/Why";
import Image from "next/image";

export default function Home() {
  return (
    <div className=" items-center justify-items-center   pb-20 gap-16  font-[family-name:var(--font-Ahmet-Altun)] overflow-x-hidden">

      <Hero />
      <Services />
      <Whyus />
      <Testimonial />
      <Location />

    </div>
  );
}
