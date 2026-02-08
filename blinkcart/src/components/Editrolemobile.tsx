"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  User,
  ShieldCheck,
  Bike,
  ArrowRight,
  Smartphone,
  Truck,
  Apple,
  Carrot,
  Milk,
  Egg,
  Croissant,
  Leaf,
  Pizza,
  Coffee,
  IceCream,
  Beef,
  Cherry,
  ShoppingBasket,
  Loader2,
} from "lucide-react";

export default function EditRoleMobile() {
  const [selectedRole, setSelectedRole] = useState("");
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, update } = useSession();

  // ðŸ”¥ Roles ko state mein rakha taaki hum filter kar sakein
  const [availableRoles, setAvailableRoles] = useState([
    {
      id: "admin",
      title: "Admin",
      icon: <ShieldCheck size={32} />,
      color: "from-purple-600 to-blue-500",
    },
    {
      id: "user",
      title: "User",
      icon: <User size={32} />,
      color: "from-blue-500 to-cyan-400",
    },
    {
      id: "deliveryBoy",
      title: "Delivery Boy",
      icon: <Bike size={32} />,
      color: "from-emerald-500 to-teal-400",
    },
  ]);

  const bgIcons = [
    { Icon: Truck, top: "5%", left: "5%", color: "text-purple-300" },
    { Icon: Apple, top: "15%", left: "85%", color: "text-red-300" },
    { Icon: Carrot, top: "40%", left: "10%", color: "text-orange-300" },
    { Icon: Milk, top: "70%", left: "5%", color: "text-blue-300" },
    { Icon: Egg, top: "85%", left: "80%", color: "text-yellow-300" },
    { Icon: Croissant, top: "10%", left: "40%", color: "text-yellow-400" },
    { Icon: Leaf, top: "60%", left: "90%", color: "text-green-300" },
    { Icon: Pizza, top: "25%", left: "20%", color: "text-red-400" },
    { Icon: Coffee, top: "55%", left: "25%", color: "text-amber-400" },
    { Icon: IceCream, top: "80%", left: "45%", color: "text-pink-300" },
    { Icon: Beef, top: "35%", left: "75%", color: "text-red-500" },
    { Icon: Cherry, top: "50%", left: "80%", color: "text-red-300" },
    { Icon: ShoppingBasket, top: "5%", left: "70%", color: "text-blue-900" },
  ];

  // ðŸ›¡ï¸ Check if Admin already exists and hide the box
  useEffect(() => {
    const checkforAdmin = async () => {
      try {
        const result = await axios.get("/api/check-for-admin");
        if (result.data.adminExist) {
          // Admin wala box list se hi uda do
          setAvailableRoles((prev) => prev.filter((r) => r.id !== "admin"));
        }
      } catch (error) {
        console.error("Admin check failed:", error);
      }
    };
    checkforAdmin();
  }, []);

  const handleGoToHome = async () => {
    if (!selectedRole || mobile.length < 10) return;

    setIsLoading(true);
    try {
      const response = await axios.post("/api/user/edit-role-mobile", {
        role: selectedRole,
        mobile,
      });

      if (response.status === 200) {
        await update({
          ...session,
          user: {
            ...session?.user,
            role: selectedRole,
          },
        });

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Something went wrong âŒ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a1a] p-6">
      {/* ðŸŒŒ Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-20 -right-20 w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px]" />
        {bgIcons.map((item, index) => (
          <motion.div
            key={index}
            animate={{
              opacity: [0.12, 0.18, 0.12],
              scale: [1, 1.1, 1],
              y: [0, -20, 0],
              rotate: [0, 12, -12, 0],
            }}
            transition={{
              duration: 7 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.25,
            }}
            className={`absolute ${item.color}`}
            style={{ top: item.top, left: item.left }}
          >
            <item.Icon size={42} strokeWidth={1.4} />
          </motion.div>
        ))}
      </div>

      {/* ðŸƒ Main UI Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-2xl p-8 md:p-12 rounded-[3rem] border border-white/10 bg-white/[0.04] backdrop-blur-[40px] shadow-2xl"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-white">Select Your Role</h2>
          <p className="text-white/40 mt-2">Final step to enter BlinkCart ðŸ›’</p>
        </div>

        {/* ðŸ‘‡ Available Roles Grid (Admin box will vanish if admin exists) */}
        <div className={`grid gap-6 mb-10 ${availableRoles.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {availableRoles.map((role) => (
            <motion.div
              key={role.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedRole(role.id)}
              className={`cursor-pointer p-6 rounded-3xl border flex flex-col items-center gap-4 transition-all
                ${selectedRole === role.id 
                  ? `bg-gradient-to-br ${role.color} text-white border-transparent shadow-xl` 
                  : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"}`}
            >
              {role.icon}
              <span className="font-bold">{role.title}</span>
            </motion.div>
          ))}
        </div>

        <div className="max-w-sm mx-auto space-y-4">
          <label className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
            <Smartphone size={16} /> Enter Mobile Number
          </label>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="9876543210"
            className="w-full text-center text-lg tracking-widest bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500"
          />
          <motion.button
            disabled={!selectedRole || mobile.length < 10 || isLoading}
            onClick={handleGoToHome}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex justify-center items-center gap-2
              ${selectedRole && mobile.length >= 10 && !isLoading 
                ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-xl" 
                : "bg-white/10 text-white/30 cursor-not-allowed"}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Processing...
              </>
            ) : (
              <>
                Go to Home <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}
