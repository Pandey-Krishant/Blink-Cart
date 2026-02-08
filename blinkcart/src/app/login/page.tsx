"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  ShoppingCart, Mail, Lock, Eye, EyeOff, ArrowLeft, 
  Truck, Shirt, Apple, Egg, Milk, Croissant, Carrot,
  Loader2 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type propType = {
  previousstep: (s: number) => void
}

export default function LoginForm({ previousstep }: propType) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showpassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router =useRouter();
  

  // Email check aur Password min 8 chars
  const isFormValid = email.includes("@") && password.length >= 8;

  useEffect(() => {
    setMounted(true);
  }, []);

  // âœ… Login Handler Logic
// âœ… Proper NextAuth Credentials Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false, // ðŸ‘ˆ Ye zaroori hai taaki page reload na ho aur hum error handle kar sakein
      });

      if (res?.error) {
        // Agar backend/NextAuth se koi error aaya (e.g., Wrong Password)
        setError("Invalid credentials! âŒ");
        // console.log("Auth Error:", res.error);
      } else {
        // Agar sab sahi hai
        // console.log("Login Successful! ðŸš€");
        router.push("/"); // Ya jahan bhi bhejona ho
        router.refresh(); // Session update karne ke liye
      }
    } catch (error) {
      setError("Something went wrong! âŒ");
      console.error("Login Exception:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return <div className="bg-[#0a0a1a] min-h-screen" />;

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a1a] font-sans">
      
      {/* â¬…ï¸ BACK BUTTON */}
      <motion.button
        whileHover={{ x: -5 }}
        onClick={() => previousstep(1)} // Welcome page par back
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
      >
        <div className="p-2 rounded-full border border-white/10 bg-white/5 group-hover:bg-white/10 transition-all">
          <ArrowLeft size={20} />
        </div>
        <span className="text-sm font-medium tracking-wide">Back</span>
      </motion.button>

      {/* Background Floating Icons (Same Vibe) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        
        <div className="absolute inset-y-0 left-0 w-1/2 opacity-20">
            <motion.div animate={{ y: [0, -25, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-[15%] left-[10%] text-purple-400"><Truck size={80} /></motion.div>
            <motion.div animate={{ rotate: [0, 20, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-[45%] left-[20%] text-white/40"><Milk size={70} /></motion.div>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 5, repeat: Infinity }} className="absolute bottom-[20%] left-[12%] text-green-400"><Apple size={60} /></motion.div>
        </div>
        <div className="absolute inset-y-0 right-0 w-1/2 opacity-20">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-[10%] right-[20%] text-blue-400"><Shirt size={100} /></motion.div>
            <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-[40%] right-[15%] text-yellow-600/60"><Croissant size={70} /></motion.div>
            <motion.div animate={{ y: [0, 30, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute bottom-[15%] right-[15%] text-yellow-400"><Egg size={80} /></motion.div>
            <motion.div className="absolute bottom-[40%] right-[5%] text-red-400"><Carrot size={80} /></motion.div>
        </div>
      </div>

      {/* Login Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-[95%] max-w-lg p-10 md:p-12 rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-[45px] shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <ShoppingCart className="text-white w-7 h-7" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">BlinkCart</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back!</h2>
          <p className="text-white/40 text-sm italic">Great to see you again.. ðŸƒ</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 ml-1"><Mail size={16} /> Email Address</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@example.com" className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500 transition-all" required />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 ml-1"><Lock size={16} /> Password</label>
                <Link href="/forgot-password" size={14} className="text-xs text-blue-400 hover:text-blue-300">Forgot?</Link>
            </div>
            <div className="relative">
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={showpassword ? "text" : "password"} placeholder="Enter password" className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500 transition-all" required />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 cursor-pointer hover:text-white" onClick={() => setShowPassword(!showpassword)}>
                {showpassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
          </div>

          {/* Login Button */}
          <motion.button
            disabled={!isFormValid || isLoading}
            whileHover={isFormValid && !isLoading ? { scale: 1.02 } : {}}
            whileTap={isFormValid && !isLoading ? { scale: 0.98 } : {}}
            type="submit"
            className={`w-full py-4 mt-2 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 
              ${isFormValid && !isLoading 
                ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white opacity-100 shadow-xl shadow-blue-500/20" 
                : "bg-white/10 text-white/20 opacity-50 cursor-not-allowed"
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Signing In...
              </>
            ) : "Sign In"}
          </motion.button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className="h-[1px] flex-1 bg-white/10"></div>
          <span className="text-white/20 text-xs font-bold tracking-widest">OR</span>
          <div className="h-[1px] flex-1 bg-white/10"></div>
        </div>

        {/* Google Login Button */}
        <motion.button
         onClick={()=>signIn("google",{ callbackUrl: "/" })}
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center gap-3 text-white font-semibold transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.94 0 3.51.68 4.75 1.81l3.51-3.51C17.91 1.05 15.22 0 12 0 7.35 0 3.39 2.67 1.39 6.57l4.09 3.18C6.46 7.17 9.03 5.04 12 5.04z"/>
            <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.89 3c2.28-2.1 3.53-5.2 3.53-8.82z"/>
            <path fill="#FBBC05" d="M5.48 14.76c-.22-.65-.35-1.35-.35-2.08s.13-1.43.35-2.08L1.39 7.42C.5 9.22 0 11.24 0 13.34s.5 4.12 1.39 5.92l4.09-3.5z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-3c-1.11.75-2.53 1.19-4.04 1.19-3.07 0-5.64-2.08-6.57-4.89l-4.09 3.18C3.39 21.33 7.35 24 12 24z"/>
          </svg>
          Sign in with Google
        </motion.button>

        <p className="text-center mt-8 text-white/40 text-sm">
          Don't have an account?{" "}
          <button onClick={() => router.push("/register")} className="text-blue-400 font-bold hover:text-blue-300">Register</button>
        </p>
      </motion.div>
    </main>
  );
}
