"use client"
import React from "react";
import { motion } from "framer-motion";
export default function Location() {
    return (
        <section id="location" className="location  w-[100%] h-[600px] flex flex-col md:flex-row items-center justify-between p-[2%] /*md:py-20 py-10*/ ">
            <motion.div
                initial={{
                    x: -100,
                    opacity: 0
                }}
                whileInView={{
                    x: 0,
                    opacity: 1
                }}
                transition={{
                    duration: 0.7,
                    ease: "easeInOut",
                }}
                viewport={{
                    once: true
                }}
                className="p-6 h-[80%] flex flex-col  justify-between w-full md:w-1/2 ">
                <h1 className="text-3xl md:text-5xl font-bold ">Location and Hours</h1>
                <div className="w-[100%]">
                    <p className="font-bold">Call us</p>
                    <p className="font-bold">BY APPOINTMENT ONLY</p>
                    <a className="font-bold underline" href="tel:+18322081071">(832) 208 1071</a>
                </div>

                <div className="w-[100%]">
                    <p className="font-bold">Location</p>
                    <p className="font-bold">5819 Richmond </p>
                    <p className="font-bold">Ave,</p>
                    <p className="font-bold">Houston, TX 77057</p>
                </div>
                <div className="w-[100%]">
                    <p className="font-bold">Monday - Friday: 10am to 6pm</p>
                    <p className="font-bold">Saturday: Apointment only</p>
                    <p className="font-bold">Sunday CLOSED</p>
                </div>
            </motion.div>
            <div className="w-full h-[80%] md:w-1/2">
                <motion.iframe
                    initial={{
                        x: 100,
                        opacity: 0
                    }}
                    whileInView={{
                        x: 0,
                        opacity: 1
                    }}
                    transition={{
                        duration: 0.7,
                        ease: "easeInOut",
                    }}
                    viewport={{
                        once: true
                    }}
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6929.129750704899!2d-95.47985730580444!3d29.732360969927583!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8640c38f5135ce79%3A0xd614d1d369805f73!2sIqballaz%20Customs!5e0!3m2!1sen!2sng!4v1734305701819!5m2!1sen!2sng"
                    width="100%"
                    height="100%"
                    className="border"
                  
                    allowFullScreen
                ></motion.iframe>
            </div>
        </section>
    );
}
