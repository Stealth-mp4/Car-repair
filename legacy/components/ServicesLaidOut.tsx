"use client"

import React from 'react'
import services from '../app/services/services.json'
import { motion } from 'framer-motion'
function ServicesLaidOut() {
  return (
    <div className='bg-[white] text-[black]'>
        {services.map((service, index)=>{
            if(index===0 || (index % 2) ===0){
                return <div key={index} id={service.title} className='flex flex-col md:flex-row items-center justify-between p-[3%] h-[fit-content] min-h-[300px]'>
                    <motion.img
                       initial={{
                x:-100,
                opacity:0
            }}
            whileInView={{
                x:0,
                opacity:1
            }}
            transition={{
                duration:0.7,
                ease:"easeInOut"
            }}
            viewport={{
                once:true
            }}
                    className='mb-[15px] md:mb-0 w-[100%] md:w-[40%] object-cover' src={service.image} alt={service.title} />
                    <div className="des w-[100%] md:w-[50%]  flex flex-col  justify-between">
                        <motion.h1
                           initial={{
                x:-100,
                opacity:0
            }}
            whileInView={{
                x:0,
                opacity:1
            }}
            transition={{
                duration:0.7,
                ease:"easeInOut",
            }}
            viewport={{
                once:true
            }}
                        className='text-3xl md:text-5xl'>{service.title}</motion.h1>
                        <motion.p 
                           initial={{
                x:-100,
                opacity:0
            }}
            whileInView={{
                x:0,
                opacity:1
            }}
            transition={{
                duration:0.7,
                ease:"easeInOut",
                delay:0.07
            }}
            viewport={{
                once:true
            }}
                        className='text-xl md:text-2xl my-[30px]'>{service.description}</motion.p>
                        <motion.h2
                           initial={{
                x:-100,
                opacity:0
            }}
            whileInView={{
                x:0,
                opacity:1
            }}
            transition={{
                duration:0.7,
                ease:"easeInOut",
                delay:0.07*2
            }}
            viewport={{
                once:true
            }}
                        className='text-xl md:text-2xl'>STARTING PRICE: {service.price}</motion.h2>
                    </div>
                </div>
            }else{
                return <div key={index} id={service.title} className='flex flex-col-reverse md:flex-row items-center justify-between p-[3%] h-[fit-content] min-h-[300px] bg-[hsla(0,_0%,_0%,_0.1)]'>
                     <div className="des w-[100%] md:w-[50%] flex flex-col justify-between">
                        <motion.h1
                           initial={{
                x:-100,
                opacity:0
            }}
            whileInView={{
                x:0,
                opacity:1
            }}
            transition={{
                duration:0.7,
                ease:"easeInOut"
            }}
            viewport={{
                once:true
            }}
                        className='text-3xl md:text-5xl'>{service.title}</motion.h1>
                        <motion.p 
                           initial={{
                x:-100,
                opacity:0
            }}
            whileInView={{
                x:0,
                opacity:1
            }}
            transition={{
                duration:0.7,
                ease:"easeInOut",
                delay:0.07
            }}
            viewport={{
                once:true
            }}
                        className='text-xl md:text-2xl my-[30px]'>{service.description}</motion.p>
                        <motion.h2
                           initial={{
                x:-100,
                opacity:0
            }}
            whileInView={{
                x:0,
                opacity:1
            }}
            transition={{
                duration:0.7,
                ease:"easeInOut",
                delay:0.07*2
            }}
            viewport={{
                once:true
            }}
                        className='text-xl md:text-2xl'>STARTING PRICE: {service.price}</motion.h2>
                    </div>
                       <motion.img
                          initial={{
                x:100,
                opacity:0
            }}
            whileInView={{
                x:0,
                opacity:1
            }}
            transition={{
                duration:0.7,
                ease:"easeInOut",
                delay:0.07
            }}
            viewport={{
                once:true
            }}
                       className='mb-[15px] md:mb-0 w-[100%] md:w-[40%] object-cover' src={service.image} alt={service.title} />
                </div>
            }
        })}
    </div>
  )
}

export default ServicesLaidOut