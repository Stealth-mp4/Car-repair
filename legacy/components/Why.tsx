'use client'
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Whyus = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(5);
  const containerRef = useRef(null);

  const vehicles = [
   
    {
      id: 1,
      image: "/img1.jpg",
      alt: "Green vintage car"
    },
    {
      id: 2,
      image: "/img2.jpg",
      alt: "Green vintage car"
    },
    {
      id: 3,
      image: "/img3.jpg",
      alt: "Green vintage car"
    },
    {
      id: 4,
      image: "/img4.jpg",
      alt: "Green vintage car"
    },
    {
      id: 5,
      image: "/img5.jpg",
      alt: "Green vintage car"
    },
    {
      id: 6,
      image: "/img6.jpg",
      alt: "Green vintage car"
    },
    {
      id: 7,
      image: "/img7.jpg",
      alt: "Green vintage car"
    },
    {
      id: 8,
      image: "/img8.jpg",
      alt: "Green vintage car"
    },
    {
      id: 9,
      image: "/img9.jpg",
      alt: "Green vintage car"
    },
  ];

  // Calculate how many items to display based on screen size
  const updateItemsToShow = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) {
        setItemsToShow(1); // 1 item on small screens
      } else if (window.innerWidth < 1024) {
        setItemsToShow(3); // 3 items on medium screens
      } else {
        setItemsToShow(5); // 5 items on large screens
      }
    }
  };

  // Set up resize listener
  useEffect(() => {
    updateItemsToShow(); // Initial setup

    const handleResize = () => {
      updateItemsToShow();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update maximum index when itemsToShow changes
  const maxIndex = Math.max(0, vehicles.length - itemsToShow);

  // Ensure currentIndex is valid when itemsToShow changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [itemsToShow, maxIndex]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= maxIndex ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex <= 0 ? maxIndex : prevIndex - 1
    );
  };

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, maxIndex]);

  // Calculate slide percentage width
  const slideWidth = 100 / itemsToShow;

  return (
    <div className="bg-black text-white py-16">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Visit The Best In Houtson
        </motion.h2>

        <motion.p
          className="text-xl text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Explore our completed projects showcasing
        </motion.p>

        <div ref={containerRef} className="relative w-full overflow-hidden">
          {/* Slider navigation buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 p-2 rounded-r-lg hover:bg-opacity-70 transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft size={40} className="text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 p-2 rounded-l-lg hover:bg-opacity-70 transition-all"
            aria-label="Next slide"
          >
            <ChevronRight size={40} className="text-white" />
          </button>

          {/* Slider container */}
          <div className="w-full overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * slideWidth}%)`,
                width: `${vehicles.length * slideWidth}%`
              }}
            >
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="px-2"
                  style={{ width: `${slideWidth}%` }}
                >
                  <div className="border-2 border-gray-800 rounded-lg overflow-hidden h-64 transition-all duration-300 hover:border-orange-500">
                    <img
                      src={vehicle.image}
                      alt={vehicle.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination indicators */}
          <div className="flex justify-center mt-4 overflow-x-auto py-2">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                className={`w-3 h-3 mx-1 rounded-full flex-shrink-0 ${currentIndex === i ? 'bg-red-700' : 'bg-gray-600'}`}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>


      </div>
    </div>
  );
};

export default Whyus;