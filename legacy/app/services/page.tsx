import ServiceBanner from '@/components/ServiceBanner'
import ServicesLaidOut from '@/components/ServicesLaidOut'
import React from 'react'

function Service() {
  return (
    <div className='mt-[88px]  font-[family-name:var(--font-Ahmet-Altun)]'>
        <ServiceBanner />
        <ServicesLaidOut />
    </div>
  )
}

export default Service