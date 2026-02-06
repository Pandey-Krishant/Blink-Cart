"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, ArrowRight, Apple, Leaf, 
  Zap, Cherry, Pizza, Coffee, Carrot 
} from "lucide-react";
import { useEffect, useState } from "react";

type propType = {
  nextstep: (s: number) => void
}

const Welcome = ({ nextstep }: propType) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const smoothTransition = { type: "spring", stiffness: 100, damping: 20 };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.15, 
        delayChildren: 0.2 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  if (!mounted) return <div className="bg-[#0a0a1a] min-h-screen" />;

  return (
    <AnimatePresence>
      <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a1a]">
        
        {/* 🎭 BACKGROUND ICONS (Dark & Subtle) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <motion.div animate={{ y: [0, 40, 0], rotate: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-[10%] left-[10%] text-red-500/40"><Apple size={100} /></motion.div>
          <motion.div animate={{ y: [0, -50, 0], rotate: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-[20%] right-[15%] text-green-500/40"><Leaf size={120} /></motion.div>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity }} className="absolute bottom-[20%] left-[15%] text-yellow-500/30"><Zap size={80} /></motion.div>
          <motion.div animate={{ y: [0, 30, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute bottom-[15%] right-[10%] text-purple-500/40"><Cherry size={90} /></motion.div>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-[45%] left-[5%] text-orange-500/20"><Pizza size={70} /></motion.div>
          <motion.div animate={{ x: [0, 20, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute top-[15%] left-[45%] text-blue-400/20"><Coffee size={60} /></motion.div>
        </div>

        {/* 1. Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 45, 0],
              opacity: [0.25, 0.35, 0.25] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-purple-600/30 blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1],
              rotate: [0, -45, 0],
              opacity: [0.2, 0.3, 0.2] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/30 blur-[120px]"
          />
        </div>

        {/* 2. Main Card */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ willChange: "transform, opacity" }} 
          className="relative z-10 w-[90%] max-w-2xl p-10 md:p-20 rounded-[2.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-[30px] shadow-2xl text-center"
        >
          {/* Logo Section */}
          <motion.div 
            variants={itemVariants}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex justify-center mb-8"
          >
            <div className="p-5 bg-gradient-to-r from-blue-500/80 to-purple-500/80 rounded-2xl shadow-xl">
              <ShoppingCart className="text-white w-10 h-10" />
            </div>
          </motion.div>

          <motion.h1 
            variants={itemVariants} 
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter"
          >
            Blink<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">Cart</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants} 
            className="text-white/40 text-lg md:text-xl mb-12 max-w-md mx-auto leading-relaxed"
          >
            Your ultimate shopping destination. Experience the future of e-commerce.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-5 justify-center items-center">
            <motion.button
              onClick={() => nextstep(2)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={smoothTransition}
              className="w-full md:w-auto px-10 py-4 rounded-xl bg-white text-[#0a0a1a] font-bold flex items-center justify-center gap-2"
            >
              Start Shopping <ArrowRight size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.98 }}
              transition={smoothTransition}
              className="w-full md:w-auto px-10 py-4 rounded-xl border border-white/10 text-white font-medium"
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Subtle Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 text-white text-[10px] tracking-[6px] uppercase font-light"
        >
          BlinkCart • 2026
        </motion.div>
      </main>
    </AnimatePresence>
  );
};

export default Welcome;