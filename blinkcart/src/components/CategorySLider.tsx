"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, Apple, Egg, Cookie, 
  CupSoda, IceCream, Coffee, Croissant, Candy, 
  Drumstick, Wind 
} from "lucide-react";

// ⚠️ DHAYAN DE: Agar file name "Backgroundicons.tsx" hai toh path sahi rakhna
import BackgroundIcons from "./Backgroundicons";

const CATEGORIES = [
  { name: "Fruits & Veg", icon: Apple, color: "text-green-400", border: "border-green-500/20" },
  { name: "Dairy & Eggs", icon: Egg, color: "text-blue-400", border: "border-blue-500/20" },
  { name: "Snacks", icon: Cookie, color: "text-orange-400", border: "border-orange-500/20" },
  { name: "Drinks", icon: CupSoda, color: "text-pink-400", border: "border-pink-500/20" },
  { name: "Frozen", icon: IceCream, color: "text-purple-400", border: "border-purple-500/20" },
  { name: "Tea & Coffee", icon: Coffee, color: "text-yellow-400", border: "border-yellow-500/20" },
  { name: "Bakery", icon: Croissant, color: "text-red-400", border: "border-red-500/20" },
  { name: "Sweets", icon: Candy, color: "text-rose-400", border: "border-rose-500/20" },
  { name: "Meat", icon: Drumstick, color: "text-amber-500", border: "border-amber-500/20" },
  { name: "Cleaning", icon: Wind, color: "text-cyan-400", border: "border-cyan-500/20" },
];

export default function CategorySlider() {
  // Fix: Adding proper type to useRef
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.1, once: false });

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Scroll checking logic
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Auto-scroll logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInView) {
      interval = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            scrollRef.current.scrollBy({ left: 220, behavior: "smooth" });
          }
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isInView]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div ref={containerRef} className="w-full py-20 bg-[#050510] relative overflow-hidden min-h-[550px]">
      
      {/* Background Layer */}
      <BackgroundIcons />

      {/* Main Glow Effects */}
      <div className="absolute top-0 left-[-5%] w-[40%] h-[40%] bg-purple-900/15 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-5%] w-[40%] h-[40%] bg-blue-900/15 blur-[130px] pointer-events-none" />

      <AnimatePresence>
        {isInView && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-[1400px] mx-auto px-6 md:px-16 relative z-10"
          >
            {/* Title Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase">
                Shop By <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">Category</span>
              </h2>
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mt-3" />
            </div>

            {/* Slider Wrapper */}
            <div className="relative flex items-center group">
              
              {/* Left Arrow Button */}
              <button 
                type="button"
                onClick={() => scroll("left")}
                className={`absolute left-[-20px] md:left-[-50px] z-50 p-4 rounded-2xl bg-white/5 border border-white/10 text-white backdrop-blur-2xl transition-all hover:bg-white/15 active:scale-90 shadow-2xl ${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              >
                <ChevronLeft size={24} strokeWidth={2.5} />
              </button>

              {/* Slider Container */}
              <div 
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex overflow-x-auto gap-6 md:gap-8 scrollbar-hide py-10 px-4 snap-x"
                style={{ scrollbarWidth: 'none' }}
              >
                {CATEGORIES.map((cat, index) => (
                  <motion.div
                    key={cat.name}
                    whileHover={{ y: -15, scale: 1.02 }}
                    className="flex-shrink-0 snap-start"
                  >
                    <div className={`w-36 h-52 md:w-44 md:h-60 bg-white/[0.03] border ${cat.border} rounded-[3rem] flex flex-col items-center justify-center p-5 text-center cursor-pointer transition-all duration-500 backdrop-blur-[40px] shadow-lg group hover:bg-white/[0.08]`}>
                      
                      <div className={`mb-5 p-4 md:p-5 rounded-3xl bg-[#0a0a1a] border border-white/5 ${cat.color} transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] group-hover:scale-110`}>
                        <cat.icon size={30} strokeWidth={1.5} className="md:w-9 md:h-9" />
                      </div>

                      <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors">
                        {cat.name}
                      </p>

                      <div className="mt-4 w-8 h-[2px] bg-white/10 rounded-full group-hover:w-16 group-hover:bg-blue-500 transition-all duration-500" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Right Arrow Button */}
              <button 
                type="button"
                onClick={() => scroll("right")}
                className={`absolute right-[-20px] md:right-[-50px] z-50 p-4 rounded-2xl bg-white/5 border border-white/10 text-white backdrop-blur-2xl transition-all hover:bg-white/15 active:scale-90 shadow-2xl ${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              >
                <ChevronRight size={24} strokeWidth={2.5} />
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}