"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Truck, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Backgroundicons from '@/components/Backgroundicons';

function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#0b0b1a] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Icons jo tune use kiye hain */}
      <Backgroundicons />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md w-full bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl text-center"
      >
        {/* Animated Check Icon */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
          className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30"
        >
          <CheckCircle2 size={48} className="text-green-500" />
        </motion.div>

        {/* Text Content */}
        <h1 className="text-3xl font-black italic uppercase tracking-wider mb-4">
          Order <span className="text-blue-500">Confirmed!</span>
        </h1>
        <p className="text-white/60 text-sm leading-relaxed mb-10 font-medium">
          Bhai, tension mat lo! Tera samaan raste mein hai aur kitchen mein taiyari shuru ho gayi hai. 😉
        </p>

        {/* Delivery Estimate Card */}
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 mb-10 flex items-center gap-5 text-left">
          <div className="p-4 bg-orange-500/20 rounded-2xl text-orange-500">
            <Truck size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Estimated Delivery</p>
            <p className="text-xl font-black italic">25 - 35 Minutes</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/user/orders" className="block">
            <button className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 group transition-all shadow-xl shadow-blue-600/20">
              Track Order <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>

          <Link href="/" className="block">
            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-2xl font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all">
              <ShoppingBag size={20} /> Order More
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Glow Effect in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-0"></div>
    </div>
  );
}

export default SuccessPage;