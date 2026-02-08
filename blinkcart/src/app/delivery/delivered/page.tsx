"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Package,
  Calendar,
  MapPin,
  Search,
  ShoppingBag,
  History,
  TrendingUp,
  Wallet,
} from "lucide-react";
import BackgroundIcons from "@/components/Backgroundicons";

const Delivered = () => {
  const [deliveredOrders, setDeliveredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await axios.get("/api/delivery/completed-assignments");
        const list = Array.isArray(result.data)
          ? result.data
          : result.data?.assignments || [];
        setDeliveredOrders(list);
      } catch (error) {
        console.error("Archive Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalEarnings = deliveredOrders.reduce(
    (acc, item) => acc + (item.order?.deliveryFee || 0),
    0
  );

  const filtered = deliveredOrders.filter(
    (item) =>
      item.order?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.order?.address?.fullname
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050510] text-white p-4 md:p-12 relative overflow-hidden font-sans">
      <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full" />

      <BackgroundIcons />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="md:col-span-2">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none mb-2">
              MISSION{" "}
              <span className="text-emerald-500 text-shadow-glow">COMPLETE</span>
            </h1>
            <p className="text-white/30 text-[10px] uppercase font-black tracking-[0.4em] flex items-center gap-2">
              <TrendingUp size={12} className="text-emerald-500" /> Performance
              Ledger Verified
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/30 uppercase font-bold mb-1">
                Total Payout
              </p>
              <p className="text-3xl font-black text-emerald-400 italic">
                ₹{totalEarnings.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/20">
              <Wallet className="text-emerald-500" size={24} />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full border border-white/10">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-[#050510] bg-emerald-500 flex items-center justify-center"
                >
                  <CheckCircle2 size={10} className="text-black" />
                </div>
              ))}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
              {deliveredOrders.length} Successfully Dispatched
            </p>
          </div>

          <div className="relative group w-full md:w-96">
            <input
              type="text"
              placeholder="Filter by Order Hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-emerald-500/40 transition-all backdrop-blur-xl"
            />
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
              size={18}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-40 text-center">
            <div className="inline-block w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Package size={80} className="text-emerald-500" />
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-tighter">
                      Order Settled
                    </span>
                    <p className="text-[10px] font-bold text-white/20 tracking-widest">
                      #{item.order?._id?.slice(-6).toUpperCase()}
                    </p>
                  </div>

                  <div className="space-y-3 mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-emerald-500/40" />
                      <p className="text-xs text-white/60">
                        {new Date(item.updatedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        â€¢ Completed
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={14} className="text-emerald-500/40 mt-1" />
                      <p className="text-xs text-white/40 italic line-clamp-1">
                        {item.order?.address?.fullAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[8px] font-black text-white/20 uppercase">
                        Earnings
                      </p>
                      <p className="text-xl font-black text-emerald-400 italic">
                        ₹{item.order?.deliveryFee || 0}
                      </p>
                    </div>
                    <button className="p-3 bg-white/5 hover:bg-emerald-500 hover:text-black rounded-xl transition-all border border-white/10 hover:border-emerald-500 shadow-lg shadow-emerald-500/0 hover:shadow-emerald-500/20">
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[4rem]">
            <History size={48} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/20 font-black uppercase tracking-widest text-xs">
              Archive is Empty
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .text-shadow-glow {
          text-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Delivered;
