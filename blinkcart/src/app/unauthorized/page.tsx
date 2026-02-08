"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  ArrowLeft, 
  LockKeyhole, 
  Apple, 
  Cherry, 
  Citrus, 
  Carrot, 
  Grape 
} from "lucide-react";
import Link from "next/link";

const Unauthorized = () => {
  // Floating icons for background
  const bgIcons = [
    { Icon: Apple, color: "text-red-500/20", top: "15%", left: "10%", delay: 0 },
    { Icon: Cherry, color: "text-pink-500/20", top: "20%", left: "80%", delay: 2 },
    { Icon: Citrus, color: "text-yellow-500/20", top: "70%", left: "15%", delay: 4 },
    { Icon: Carrot, color: "text-orange-500/20", top: "75%", left: "85%", delay: 1 },
    { Icon: Grape, color: "text-purple-500/20", top: "10%", left: "50%", delay: 3 },
  ];

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center relative overflow-hidden px-4">
      
      {/* ðŸŒŒ Animated Background Glows */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" 
      />

      {/* ðŸŽ Floating Background Icons */}
      {bgIcons.map((item, index) => (
        <motion.div
          key={index}
          initial={{ y: 0 }}
          animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
          className={`absolute z-0 ${item.color}`}
          style={{ top: item.top, left: item.left }}
        >
          <item.Icon size={60} />
        </motion.div>
      ))}

      <div className="relative z-10 w-full max-w-lg">
        {/* ðŸ’Ž Premium Glass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white/[0.02] backdrop-blur-[30px] border border-white/10 rounded-[3rem] p-10 md:p-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group"
        >
          {/* Glass Reflection Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          <div className="relative mb-10 flex justify-center">
            {/* ðŸ›¡ï¸ Central Icon with Glow */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-28 h-28 bg-gradient-to-tr from-red-500/20 to-orange-500/20 rounded-[2rem] border border-red-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.2)]"
            >
              <ShieldAlert size={56} className="text-red-500" />
            </motion.div>
            <LockKeyhole className="absolute -bottom-2 -right-2 text-white/40" size={36} />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Blink <span className="text-red-500">Cart</span>
          </h1>
          
          <div className="space-y-4 mb-10">
             <h2 className="text-xl font-bold text-white/90">Unauthorized Access!</h2>
             <p className="text-white/50 text-base leading-relaxed">
               Bro, you're trying to enter a restricted zone. Only admins can manage the fresh stock. 
               Please use your <span className="text-blue-400 font-bold">Admin Credentials</span>.
             </p>
          </div>

          {/* ðŸ•¹ï¸ Navigation Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 py-4 rounded-2xl font-bold transition-all active:scale-95">
              <ArrowLeft size={18} />
              Browse Store
            </Link>
            
            <Link href="/login" className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20">
              Admin Login
            </Link>
          </div>
        </motion.div>

        {/* ðŸ·ï¸ Bottom Security Badge */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center gap-2 mt-8 opacity-30 group"
        >
          <div className="h-[1px] w-8 bg-white" />
          <span className="text-white text-[10px] font-bold uppercase tracking-[0.4em]">Secure Access Point</span>
          <div className="h-[1px] w-8 bg-white" />
        </motion.div>
      </div>
    </div>
  );
};

export default Unauthorized;
