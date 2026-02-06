"use client"; // Animation ke liye client component zaruri hai

import { motion } from "framer-motion";
import {
  Apple,
  Carrot,
  Pizza,
  IceCream,
  ShoppingBasket,
  Coffee,
  Cookie,
  Cherry,
  Grape,
} from "lucide-react";
import "./globals.css";
import Provider from "@/Provider";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/InitUser";

// Icon Component for Clean Code
const FloatingIcon = ({
  icon: Icon,
  top,
  left,
  color,
  delay,
  duration,
}: any) => (
  <motion.div
    initial={{ opacity: 0.1, scale: 0.8 }}
    animate={{
      opacity: [0.1, 0.4, 0.1],
      scale: [0.8, 1.1, 0.8],
      y: [0, -15, 0],
      rotate: [0, 10, -10, 0],
    }}
    transition={{
      duration: duration || 4,
      repeat: Infinity,
      delay: delay || 0,
      ease: "easeInOut",
    }}
    style={{ position: "absolute", top, left, color }}
    className="pointer-events-none select-none blur-[0.5px]"
  >
    <Icon size={35} />
  </motion.div>
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a1a] text-white min-h-screen relative overflow-x-hidden antialiased">
        {/* 🌌 Animated Background Layer */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* 🌈 Primary Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/15 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/15 blur-[150px] rounded-full" />

          {/* 🍎 Animated Colorful Icons */}
          <FloatingIcon
            icon={Apple}
            top="10%"
            left="5%"
            color="#ef4444"
            delay={0}
            duration={5}
          />
          <FloatingIcon
            icon={Carrot}
            top="25%"
            left="85%"
            color="#f97316"
            delay={1}
            duration={6}
          />
          <FloatingIcon
            icon={Pizza}
            top="50%"
            left="12%"
            color="#eab308"
            delay={2}
            duration={4}
          />
          <FloatingIcon
            icon={IceCream}
            top="80%"
            left="15%"
            color="#ec4899"
            delay={0.5}
            duration={7}
          />
          <FloatingIcon
            icon={Coffee}
            top="15%"
            left="45%"
            color="#a855f7"
            delay={1.5}
            duration={5}
          />
          <FloatingIcon
            icon={ShoppingBasket}
            top="40%"
            left="75%"
            color="#3b82f6"
            delay={3}
            duration={8}
          />
          <FloatingIcon
            icon={Cookie}
            top="70%"
            left="80%"
            color="#8b4513"
            delay={2.5}
            duration={5}
          />
          <FloatingIcon
            icon={Cherry}
            top="5%"
            left="70%"
            color="#f43f5e"
            delay={1.2}
            duration={6}
          />
          <FloatingIcon
            icon={Grape}
            top="65%"
            left="40%"
            color="#8b5cf6"
            delay={0.8}
            duration={4}
          />
        </div>

        {/* 📄 Content Layer */}
        <div className="relative z-10">
          <Provider>
            <StoreProvider>
              <InitUser />
              {children}
            </StoreProvider>
          </Provider>
        </div>
      </body>
    </html>
  );
}
