// components/Testimonials.tsx
'use client';

import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { motion } from "framer-motion";
import { BiSolidQuoteSingleRight } from "react-icons/bi";
import Link from "next/link";
export default function Testimonials() {
    const testimonials = [
        {
            quote: "Zarak is amazing guy who knows how to wrap professionally and listen to customer thoroughly. He recently did my wrap and he did it perfect, no peeling corners or visible stainless steel whatsoever! People think it is paint as it covers full truck. Zarak’s attention to detail made it possible that I can now drive this Cybertruck stress free knowing that this is best wrap work done! Highly recommend Iqballaz Customs. They are also reasonably priced which is a plus!",
            author: "Mike Maknojia",
        },
        {
            quote: "The owner (Zarak) is truly the only person i’ve trusted with building my car over the past 3 years. Zarak has consistently delivered perfect service. His expertise, care, and amazing spirit make every visit exceptional. Highly recommend!!",
            author: "Jad Barazi",
        },
        {
            quote: "We recently had our car wrapped by zarak and I couldn’t be happier with the outcome. I Highly recommend Zarak for anyone looking to elevate their car’s look and keep it running smoothly.",
            author: "Yousef Abu halaweh",
        },
        {
            quote: "This guy Zarak is the only person I trust to work on my car! He puts in 110% on the work he does, I am happy to be a loyal customer! Can't wait to see what else we are going to do on my car!",
            author: "RAMYEEZY",
        },
        {
            quote: "Zarak does amazing work, he’s so detailed and his prices are very reasonable compared to other shops. The most important thing to me aside from customer service was his punctuality, he delivered my car when he said he would! I highly recommend his work!",
            author: "Ayesha Faisal",
        },
        {
            quote: "10/10 service. The amount of attention to detail zarak puts into his work really shows. I got my car wrapped, windows tinted, and my oil changed. Zarak did all of it, and the speed and quality which he did it with was amazing. Very fair prices and he’s willing to work with you in that regard. Truly one of the only guys out there that cares about his customers. Recommend a few of my guys to him and they liked him as well.",
            author: "Adam",
        },
        {
            quote: "Great service, flawless quality, and nothing else for me to say other than that Zarak will get shit done. Definitely will be my go-to whenever I need to get any of my other cars wrapped and taken care of.",
            author: "Omar Yasin",
        },
    ];

    const responsive = {
        superLargeDesktop: { breakpoint: { max: 4000, min: 3000 }, items: 1 },
        desktop: { breakpoint: { max: 3000, min: 1024 }, items: 1 },
        tablet: { breakpoint: { max: 1024, min: 464 }, items: 1 },
        mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
    };

    return (
        <section className="bg-black text-white md:py-20 py-10  w-[100%] " id="reviews">
            <motion.h2
                initial={{
                    y: 100,
                    opacity: 0
                }}
                whileInView={{
                    y: 0,
                    opacity: 1
                }}
                transition={{
                    duration: 0.7,
                    ease: "easeInOut",
                }}
                viewport={{
                    once: true
                }}
                className="text-3xl font-bold text-center mb-6">What Our Customers Say</motion.h2>
            <motion.div
                initial={{
                    y: 100,
                    opacity: 0
                }}
                whileInView={{
                    y: 0,
                    opacity: 1
                }}
                transition={{
                    duration: 0.7,
                    ease: "easeInOut",
                }}
                viewport={{
                    once: true
                }}
            >
                <Carousel
                    responsive={responsive} showDots={false} autoPlay={true} autoPlaySpeed={3000} infinite={true}
                    className="/*max-w-3xl*/ w-[100%] mx-auto"
                >
                    {testimonials.map((testimonial, index) => (
                        <div
                            className=" flex flex-col items-center text-center px-6 py-8 rounded-lg shadow-md"
                            key={index}
                        >
                            <div className="flex my-[30px]"><BiSolidQuoteSingleRight className="w-[30px] h-[30px] text-[red]" /><BiSolidQuoteSingleRight className="w-[30px] h-[30px] text-[red]" /></div>
                            <blockquote className="italic text-lg">"{testimonial.quote}"</blockquote>
                            <footer className="mt-4 text-sm font-semibold">- {testimonial.author}</footer>
                        </div>
                    ))}
                </Carousel>
            </motion.div>


            <div className="flex  items-center justify-center mt-10">
                <Link className="text-center p-3 bg-red-600 rounded-md"
                    href="https://www.google.com/maps/place/Iqballaz+Customs/@29.7309635,-95.4819387,17z/data=!3m1!5s0x8640c3d722513145:0x72ddfedb22b1f77f!4m8!3m7!1s0x8640c38f5135ce79:0xd614d1d369805f73!8m2!3d29.7309635!4d-95.4819387!9m1!1b1!16s%2Fg%2F11y8m66hn0?entry=ttu&g_ep=EgoyMDI0MTIxMS4wIKXMDSoASAFQAw%3D%3D">

                    Add Review
                </Link>
            </div>

        </section>
    );
}
