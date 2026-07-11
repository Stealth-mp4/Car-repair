'use client';
import React from "react";
import { motion } from "framer-motion";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

export default function ContactForm() {
    return (
        <section className="bg-black text-white py-12">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Section */}
                    <div className="text-center md:text-left">
                       {/* <h2 className="text-3xl font-bold mb-4">JLE CUSTOMS</h2>*/}
                       <img className="w-24 h-24" src="/logo.jpg" alt="logo" />
                       
                        <div>
                            <p className="text-xl"> 5819 Richmond Ave., Houston, TX 77057</p>
                            <a href="tel:(832) 208 1071"><p className="text-red-500 font-bold text-lg mb-2">(832) 208 1071</p></a>
                            <a href="mailto:iqballazcustoms@gmail.com"><p className="text-red-500 font-bold text-lg mb-2">iqballazcustoms@gmail.com</p></a>
                        </div>
                        <div className="flex justify-center md:justify-start  mt-10 space-x-6">
                            <motion.a
                                href="https://www.instagram.com/iqballazcustoms/"
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.7, delay: 0.1 }}
                                viewport={{ once: true }}
                            >
                                <FaInstagram size={24} />
                            </motion.a>
                            <motion.a
                                href="https://www.facebook.com/share/15XgEEfB5M/?mibextid=wwXIfr"
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                viewport={{ once: true }}
                            >
                                <FaFacebookF size={24} />
                            </motion.a>
                           
                        </div>
                        <div className="mt-[20px] flex flex-col">
                        <a href="/privacy" className=" my-[5px] text-sm">PRIVACY POLICY</a>
                        <p  className=" my-[5px] text-sm">TERMS OF SERVICE</p>
                        <p className=" my-[5px] text-sm">@ IQBALLAZ CUSTOMS 2024</p>
                        </div>
                    </div>


                    {/* Right Section - Form */}
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeInOut" }}
                        viewport={{ once: true }}
                        className="bg-white p-6 rounded-md shadow-md text-black"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* First Name */}
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-semibold mb-2">
                                    First Name *
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    placeholder="Enter your first name"
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            {/* Last Name */}
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-semibold mb-2">
                                    Last Name *
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    placeholder="Enter your last name"
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="mb-4">
                            <label htmlFor="phone" className="block text-sm font-semibold mb-2">
                                Phone Number *
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                placeholder="Enter your phone number"
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        {/* Message */}
                        <div className="mb-4">
                            <label htmlFor="message" className="block text-sm font-semibold mb-2">
                                Write a message *
                            </label>
                            <textarea
                                id="message"
                                rows={4}
                                placeholder="Type your message here"
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                            ></textarea>
                        </div>

                        {/* reCAPTCHA Placeholder */}
                        <div className="mb-4">
                            <div className="bg-gray-200 rounded p-4 text-center text-gray-600">
                                reCAPTCHA Placeholder
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-all"
                            >
                                Submit
                            </button>
                        </div>
                    </motion.form>
                </div>
            </div>
        </section>
    );
}
