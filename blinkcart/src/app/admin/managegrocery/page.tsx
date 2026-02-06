"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Search, Clock, CheckCircle2, Truck, 
  AlertCircle, Eye, RefreshCcw, X, MapPin, User, ShoppingBag, CreditCard, Phone
} from "lucide-react";
import axios from "axios";
import BackgroundIcons from "@/components/Backgroundicons";

// Status Colors and Icons
const statusConfig: any = {
  pending: { color: "text-yellow-400", bg: "bg-yellow-400/10", icon: Clock },
  confirmed: { color: "text-purple-400", bg: "bg-purple-400/10", icon: Package },
  shipped: { color: "text-blue-400", bg: "bg-blue-400/10", icon: Truck },
  "out for delivery": { color: "text-orange-400", bg: "bg-orange-400/10", icon: Truck },
  delivered: { color: "text-green-400", bg: "bg-green-400/10", icon: CheckCircle2 },
  cancelled: { color: "text-red-400", bg: "bg-red-400/10", icon: AlertCircle },
};

// Colorful Backgrounds for Avatars
const avatarColors = [
  "bg-pink-500/20 text-pink-400 border-pink-500/20",
  "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  "bg-amber-500/20 text-amber-400 border-amber-500/20",
  "bg-violet-500/20 text-violet-400 border-violet-500/20",
  "bg-cyan-500/20 text-cyan-400 border-cyan-500/20",
  "bg-rose-500/20 text-rose-400 border-rose-500/20",
];

const allStatuses = ["pending", "confirmed", "shipped", "out for delivery", "delivered", "cancelled"];

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [availableBoys, setAvailableBoys] = useState<any[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/managegrocery");
      setOrders(res.data);
    } catch (err) {
      console.error("Order fetching error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { data } = await axios.post(`/api/admin/updateorderstatus/${orderId}`, { status: newStatus });

      // update local state so UI reflects change without reload
      setOrders((prev: any) => prev.map((o: any) => o._id === orderId ? { ...o, status: newStatus } : o));
      setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));

      // if backend returned available delivery boys, store them for UI
      if (data?.availableBoys) {
        setAvailableBoys(data.availableBoys);
      } else {
        setAvailableBoys([]);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filteredOrders = orders.filter((order: any) => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.address?.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050510] pt-28 pb-10 px-4 sm:px-8 overflow-x-hidden">
      {/* Background Glows */}
      <BackgroundIcons/>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
              Manage <span className="text-blue-500 text-shadow-glow">Orders</span>
            </h1>
            <p className="text-white/40 text-sm font-medium mt-1 uppercase tracking-widest">
              Live Tracker • {orders.length} total
            </p>
          </div>

          <div className="flex items-center gap-3">
             <button onClick={fetchOrders} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-blue-400 transition-all active:scale-90">
               <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
             </button>
             <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Find an order..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-white text-sm outline-none focus:border-blue-500/50 w-full md:w-80 transition-all shadow-inner"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
             </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#0a0a1a]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
               <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
               <p className="text-white/40 font-bold animate-pulse">Synchronizing Data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Order ID</th>
                    <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Customer</th>
                    <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Status</th>
                    <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Amount</th>
                    <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Quick View</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredOrders.map((order: any, index) => {
                      const StatusIcon = statusConfig[order.status || 'pending'].icon;
                      const randomColor = avatarColors[index % avatarColors.length];
                      return (
                        <motion.tr 
                          key={order._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-white/5 hover:bg-blue-500/[0.02] transition-colors group"
                        >
                          <td className="p-6">
                            <span className="text-white font-black text-xs tracking-tighter bg-white/5 px-3 py-1 rounded-lg">
                              #{order._id.slice(-6).toUpperCase()}
                            </span>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-black text-xs ${randomColor}`}>
                                {order.address?.fullname?.charAt(0) || "U"}
                              </div>
                              <span className="text-white font-bold text-sm tracking-tight">{order.address?.fullname || "Anonymous"}</span>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${statusConfig[order.status || 'pending'].bg} ${statusConfig[order.status || 'pending'].color} border-white/5`}>
                               <StatusIcon size={14} />
                               <span className="text-[10px] font-black uppercase tracking-wide">{order.status || 'pending'}</span>
                            </div>
                          </td>
                          <td className="p-6 text-white font-black text-sm italic">₹{order.totalAmount}</td>
                          <td className="p-6">
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="p-2.5 bg-blue-600/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-blue-500/40 active:scale-90"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- SIDEBAR DRAWER --- */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-[#080815] border-l border-white/10 z-[101] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div>
                  <h2 className="text-xl font-black text-white italic tracking-tighter">ORDER <span className="text-blue-500">INSPECT</span></h2>
                  <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em]">UID-{selectedOrder._id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-3 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-2xl text-white/20 transition-all"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-sidebar-scroll">
                
                {/* Status Update */}
                <div className="p-1 bg-white/5 rounded-[2rem] border border-white/10">
                  <select 
                    value={selectedOrder.status}
                    disabled={updating}
                    onChange={(e) => updateStatus(selectedOrder._id, e.target.value)}
                    className="w-full bg-transparent py-4 px-6 text-white text-xs font-black uppercase tracking-widest outline-none cursor-pointer"
                  >
                    {allStatuses.map(s => (
                      <option key={s} value={s} className="bg-[#0d0d1a] text-white uppercase">{s}</option>
                    ))}
                  </select>
                </div>

                {/* Customer Section */}
                <div className="space-y-4">
                   <h3 className="text-blue-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><User size={14}/> Client Profile</h3>
                   <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 space-y-4 shadow-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                          {selectedOrder.address?.fullname?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-black text-lg tracking-tight">{selectedOrder.address?.fullname}</p>
                          <div className="flex items-center gap-2 text-white/40 text-xs font-bold mt-1">
                            <Phone size={12} className="text-blue-500"/> {selectedOrder.address?.mobile}
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5 flex gap-3">
                        <MapPin className="text-red-500 shrink-0" size={18} />
                        <p className="text-white/60 text-[11px] leading-relaxed font-bold">
                          {selectedOrder.address?.fullAddress}, {selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}
                        </p>
                      </div>
                   </div>
                </div>

                {/* Cart Items */}
                <div className="space-y-4">
                  <h3 className="text-purple-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><ShoppingBag size={14}/> Manifest</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-white/5 border border-white/10 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="text-white font-black text-xs uppercase tracking-tighter">{item.name}</p>
                            <p className="text-white/30 text-[10px] font-bold italic">{item.quantity} x ₹{item.price}</p>
                          </div>
                        </div>
                        <p className="text-blue-400 font-black text-sm italic">₹{Number(item.price) * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Bill */}
                <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-[2.5rem] border border-white/10 p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 text-white/50 text-[10px] font-black uppercase tracking-widest">
                      <CreditCard size={14} className="text-blue-500"/> {selectedOrder.paymentMethod}
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedOrder.isPaid ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-red-500/20 text-red-500 border border-red-500/20'}`}>
                      {selectedOrder.isPaid ? 'Payment Received' : 'Payment Pending'}
                    </div>
                  </div>
                  <div className="flex justify-between items-end border-t border-white/10 pt-6">
                    <span className="text-white/40 font-black italic uppercase text-xs">Total Payable</span>
                    <span className="text-white font-black text-4xl tracking-tighter text-shadow-glow">₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}