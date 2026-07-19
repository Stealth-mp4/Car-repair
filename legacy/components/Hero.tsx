'use client';
import React from "react";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <motion.section
            id="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative bg-cover bg-center text-white h-screen w-full md:py-20 py-10  flex flex-col justify-center items-center"
            style={{ backgroundImage: "url('/cover.jpeg')" }}
        >

            <motion.div
                className="absolute inset-0 bg-black opacity-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            ></motion.div>


            <div className="relative z-10 text-center px-4">
                <motion.div
                    className="flex items-center justify-center mb-2"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                >
                    <div className="flex text-yellow-400 text-2xl">
                        <span>★</span>
                        <span>★</span>
                        <span>★</span>
                        <span>★</span>
                        <span>★</span>
                    </div>
                    <span className="ml-2 font-semibold">5-Star Rated</span>
                </motion.div>
                <motion.h1
                    className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                >
                    Customize Your Vehicle Today!
                </motion.h1>
                <div className="flex gap-5 items-center mt-10 justify-center">
                    <motion.button
                        className="bg-red-600 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded text-white uppercase text-sm sm:text-base md:text-lg"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.6,
                            ease: "easeInOut",
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <a href="https://calendly.com/iqballazcustoms/30min"> BOOK TO SCHEDULE</a>
                    </motion.button>
                    <motion.button
                        className="bg-red-600  px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded text-white uppercase text-sm sm:text-base md:text-lg"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.6,
                            ease: "easeInOut",
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <a href="tel:+18322081071"> CALL TO SCHEDULE</a>
                    </motion.button>
                </div>
            </div>
        </motion.section>
    );
}
