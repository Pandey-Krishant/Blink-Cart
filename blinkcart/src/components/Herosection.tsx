"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop",
    title: "Fresh Farm Groceries",
    subtitle: "Delivered to your doorstep in 10 minutes",
    color: "from-green-500",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=2070&auto=format&fit=crop",
    title: "Organic Vegetables",
    subtitle: "Eat healthy, live better with 100% organic produce",
    color: "from-orange-500",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1974&auto=format&fit=crop",
    title: "Premium Snacks & Drinks",
    subtitle: "Everything you need for your late-night cravings",
    color: "from-blue-500",
  },
  {
    id: 4,
    // ðŸ”¥ New Premium Bakery/Dairy Image
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072&auto=format&fit=crop", 
    title: "Dairy & Bakery Fresh",
    subtitle: "Start your morning with freshly baked bread and pure milk",
    color: "from-amber-500",
  }
];

const Herosection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  const nextSlide = () => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <section className="relative w-full h-[500px] md:h-[600px] mt-28 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full relative group">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full h-full rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl"
          >
            {/* ðŸ–¼ï¸ Image Layer */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] group-hover:scale-105"
              style={{ backgroundImage: `url(${slides[current].image})` }}
            >
              {/* Dark Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slides[current].color}/30 via-[#0a0a1a]/60 to-[#0a0a1a]/90`} />
            </div>

            {/* ðŸ“ Content Layer */}
            <div className="relative h-full z-10 flex flex-col justify-center px-8 md:px-16 max-w-2xl">
              <motion.span
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-blue-400 font-black uppercase tracking-[0.3em] text-xs md:text-sm mb-4"
              >
                BlinkCart Exclusive
              </motion.span>
              
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-7xl font-black text-white leading-tight mb-6"
              >
                {slides[current].title.split(" ").map((word, i) => (
                  <span key={i} className={i === 1 ? "text-blue-500" : ""}>{word} </span>
                ))}
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/70 text-lg md:text-xl mb-8 leading-relaxed"
              >
                {slides[current].subtitle}
              </motion.p>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <button className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-[0_10px_30px_rgba(59,130,246,0.4)] group/btn">
                  <ShoppingCart size={22} className="group-hover:translate-x-1 transition-transform" />
                  Shop Now
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ðŸ•¹ï¸ Navigation Buttons */}
        <div className="absolute inset-0 flex items-center justify-between px-6 z-20 pointer-events-none">
          <button 
            onClick={prevSlide}
            className="p-4 rounded-full bg-[#0a0a1a]/40 border border-white/10 text-white hover:bg-blue-600 transition-all backdrop-blur-md pointer-events-auto opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={28} />
          </button>
          <button 
            onClick={nextSlide}
            className="p-4 rounded-full bg-[#0a0a1a]/40 border border-white/10 text-white hover:bg-blue-600 transition-all backdrop-blur-md pointer-events-auto opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* âºï¸ Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                index === current ? "w-10 bg-blue-500" : "w-2.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Herosection;
