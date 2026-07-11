import React from 'react'

function page() {
  return (
    <section className=' flex justify-center py-4 text-center mt-[128px] bg-[white] text-[black] font-[family-name:var(--font-Ahmet-Altun)]'>
    <div className='flex flex-col w-[70%]'>
        <h1 className='text-3xl md:text-4xl text-red-500 mb-[50px]'>Welcome to Iqballaz Customs!</h1>
        <div className='mb-[100px]'>
        <h2 className='text-xl md:text-2xl text-red-500'>What Information We Collect and Why</h2>
        <p>We may ask for certain details, like your name or contact information, to provide a better experience. This personal information helps us reach you, whether it’s to respond to inquiries, share updates, or improve your overall experience with us.</p>
        </div>
        <div className='mb-[100px]'>
        <h2 className='text-xl md:text-2xl text-red-500'>Browsing Data We Gather</h2>
        <p>When you explore our Site, your browser automatically shares details like your IP address, browser type, pages you visit, and how long you spend on them. This 'log data' helps us understand how people use our website so we can make it better for everyone.</p>
        </div>
        <div className='mb-[100px]'>
        <h2 className='text-xl md:text-2xl text-red-500'>How We Communicate with You</h2>
        <p>If you’ve shared your information with us, we may occasionally send you updates, promotions, or other news about Iqballaz Customs. You’re welcome to opt out of these communications anytime.</p>
        </div>
        <div className='mb-[100px]'>
        <h2 className='text-xl md:text-2xl text-red-500'>Cookies</h2>
        <p>We use cookies—tiny data files stored on your device—to enhance your browsing experience. Cookies let us remember your preferences and improve functionality. You can choose to disable cookies in your browser settings, but keep in mind some parts of the Site may not work as smoothly without them.</p>
        </div>
        <div className='mb-[100px]'>
        <h2 className='text-xl md:text-2xl text-red-500'>Keeping Your Information Safe</h2>
        <p>We work hard to keep your personal information secure, but no online system is completely foolproof. While we take reasonable measures to protect your data, we can’t promise 100% security.</p>
        </div>
        <div className='mb-[100px]'>
        <h2 className='text-xl md:text-2xl text-red-500'>Policy Updates</h2>
        <p>From time to time, we might tweak this privacy policy to reflect changes in our practices or services. Any updates will be posted here, and they’ll take effect as soon as they’re live. By continuing to use our Site after changes are made, you’re agreeing to the updated policy.</p>
        <p className='mt-[30px]'>If there’s a major change, we’ll make sure to notify you—either via email or by highlighting the update on the Site.</p>
        </div>
       <div className='mb-[100px]'>
       <h2 className='text-xl md:text-2xl text-red-500'>Need Help? Let’s Talk!</h2>
       <p>Got questions about how we handle your information? We’re here to help. Reach out to us, and we’ll be happy to assist.</p>
       </div>
    </div>
    </section>
  )
}

export default page