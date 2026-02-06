"use client";
import { motion } from "framer-motion";
import { 
  Apple, 
  Leaf, 
  Zap, 
  Cherry, 
  Pizza, 
  Coffee, 
  Carrot, 
  Citrus 
} from "lucide-react";

// 🎨 Color Opacity ko /10 se badha kar /25 kiya hai aur Glow add kiya hai
const ICONS = [
  { Icon: Apple, top: "10%", left: "5%", size: 45, color: "text-red-500/25" },
  { Icon: Leaf, top: "20%", left: "80%", size: 55, color: "text-green-500/25" },
  { Icon: Citrus, top: "75%", left: "30%", size: 40, color: "text-pink-500/25" },
  { Icon: Zap, top: "70%", left: "10%", size: 40, color: "text-yellow-500/25" },
  { Icon: Cherry, top: "85%", left: "85%", size: 50, color: "text-purple-500/25" },
  { Icon: Pizza, top: "40%", left: "92%", size: 35, color: "text-orange-500/25" },
  { Icon: Leaf, top: "20%", left: "70%", size: 55, color: "text-green-500/25" },
  { Icon: Coffee, top: "15%", left: "45%", size: 30, color: "text-blue-500/25" },
  { Icon: Citrus, top: "75%", left: "40%", size: 40, color: "text-pink-500/25" },
  { Icon: Carrot, top: "50%", left: "8%", size: 50, color: "text-orange-600/25" },
  { Icon: Citrus, top: "75%", left: "40%", size: 40, color: "text-pink-500/25" },
];

export default function BackgroundIcons() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-transparent">
      {ICONS.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: 1,
            scale: 1,
            y: [0, -30, 0], // Floating movement thodi badha di
            rotate: [0, 20, -20, 0] 
          }}
          transition={{ 
            duration: 8 + i, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className={`absolute ${item.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]`}
          style={{ top: item.top, left: item.left }}
        >
          {/* Stroke width ko thoda thick kiya taaki outline dikhe */}
          <item.Icon size={item.size} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
}