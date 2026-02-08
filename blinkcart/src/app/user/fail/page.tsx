"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, RefreshCcw, AlertTriangle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Backgroundicons from '@/components/Backgroundicons';

function CancelPage() {
  return (
    <div className="min-h-screen bg-[#0b0b1a] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Icons */}
      <Backgroundicons />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-md w-full bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl text-center"
      >
        {/* Animated Error Icon */}
        <motion.div 
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/30"
        >
          <XCircle size={48} className="text-red-500" />
        </motion.div>

        {/* Text Content */}
        <h1 className="text-3xl font-black italic uppercase tracking-wider mb-4">
          Payment <span className="text-red-500">Failed!</span>
        </h1>
        <p className="text-white/60 text-sm leading-relaxed mb-10 font-medium">
          Arey bro! Lagta hai transaction mein kuch locha ho gaya. Tension mat lo, paise nahi kate honge. ðŸ˜‰
        </p>

        {/* Info Card */}
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 mb-10 flex items-center gap-5 text-left">
          <div className="p-4 bg-yellow-500/20 rounded-2xl text-yellow-500">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Common Reason</p>
            <p className="text-sm font-bold opacity-90 italic">Bank server or insufficient funds</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/user/checkout" className="block">
            <button className="w-full bg-red-600 hover:bg-red-500 py-5 rounded-2xl font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 group transition-all shadow-xl shadow-red-600/20">
              <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" /> 
              Try Again Bro
            </button>
          </Link>

          <Link href="/user/cart" className="block">
            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-2xl font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all">
              <ChevronLeft size={20} /> Back to Cart
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Red Glow Effect in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full -z-0"></div>
    </div>
  );
}

export default CancelPage;
