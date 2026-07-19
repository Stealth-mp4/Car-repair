'use client';
import React from "react";
import { motion } from "framer-motion";
const services = [
    {
        title: "VINYL WRAP",
        description: "High-quality vinyl made to last.",
        img: "/Vinyl.jpeg",
    },
    {
        title: "WINDOW TINT",
        description: "Protect from harmful UV rays.",
        img: "/resize_2.png",
    },
    {
        title: "PAINT PROTECTION FILM",
        description: "Protect your car's exterior.",
        img: "/resize_3.png",
    },
    {
        title: "WHEELS POWDER COAT",
        description: "Durable, long-lasting coating.",
        img: "/resize_4.png",
    },
    {
        title: "CHROME DELETE",
        description: "Eliminates all chrome.",
        img: "/resize_5.png",
    },
    {
        title: "CALIPER PAINT",
        description: "Durable, long-lasting coating.",
        img: "/caliper.png",
    },
];
const removed = "grid-cols-1 md:grid-cols-3"
export default function Services() {
    return (
        <section className=" flex flex-col items-center md:py-20 py-10 w-[100%] bg-[white] text-[black] ">

            <h2 className="text-3xl font-bold text-center mb-8">Our Services</h2>
            <div className="grid services w-[90%] gap-6 md:px-6">
                {services.map((service, index) => (
                    <a key={index} href={`/services/#${service.title}`}><motion.div
                        className="border cursor-pointer service bg-[hsla(0,_0%,_0%,_0.1)] rounded-[2px] p-6 text-center flex flex-col items-center overflow-hidden"
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
                            delay: 0.07 * index
                        }}
                        viewport={{
                            once: true
                        }}
                    >
                        {service.title==="WHEELS POWDER COAT"?<img
                            src={service.img}
                            alt={service.title}
                            className="mb-4 w-full h-48 object-cover  origin-bottom"
                        />:<img
                        src={service.img}
                        alt={service.title}
                        className="mb-4 w-full h-48 object-cover"
                    />}
                        <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                        <p className="font-bold">{service.description}</p>
                        <button className="mt-4 bg-red-600 text-white font-bold px-4 py-2 rounded">
                            Read More
                        </button>
                    </motion.div>
                    </a>
                ))}
            </div>
            <a href="/services"><motion.button
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
                className="mt-[50px] bg-red-600 text-white font-bold px-4 py-2 rounded">View Services</motion.button></a>
        </section>
    );
}
