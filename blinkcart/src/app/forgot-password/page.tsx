"use client";

import React from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import Backgroundicons from "@/components/Backgroundicons";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0b0b1a] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <Backgroundicons />

      <div className="relative z-10 max-w-md w-full bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl text-center">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
          <Mail size={36} className="text-blue-400" />
        </div>

        <h1 className="text-2xl font-black uppercase tracking-wider mb-3">
          Forgot <span className="text-blue-500">Password</span>
        </h1>
        <p className="text-white/50 text-sm leading-relaxed mb-8 font-medium">
          Password reset flow will be enabled soon. For now, please contact the
          admin to reset your account.
        </p>

        <Link href="/login" className="inline-flex items-center gap-2 text-blue-400 font-black uppercase tracking-widest text-xs hover:text-blue-300 transition-all">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </div>
  );
}
