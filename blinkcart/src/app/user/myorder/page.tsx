"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // 🔥 Import router
import { 
  Package, ChevronDown, MapPin, Calendar, 
  CreditCard, Tag, ShoppingBag, Loader2, 
  CheckCircle2, Clock, Smartphone, ArrowLeft // 🔥 Import ArrowLeft
} from 'lucide-react';
import Backgroundicons from '@/components/Backgroundicons';

// ... (Interfaces same rahenge)

function MyOrdersPage() {
  const router = useRouter(); // 🔥 Router initialize kiya
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/user/myorder');
        const data = Array.isArray(response.data) ? response.data : [response.data];
        setOrders(data);
      } catch (error) {
        console.error("Order fetch error bro:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleOrder = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b1a] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px]">Syncing your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b1a] text-white p-4 md:p-12 relative overflow-hidden">
      <Backgroundicons />
      
      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* --- Back Button & Header Section --- */}
        <header className="mb-12 relative flex items-center justify-center">
          {/* 🔥 Upper Left Back Button */}
          <button 
            onClick={() => router.back()}
            className="absolute left-0 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all group active:scale-90"
          >
            <ArrowLeft size={20} className="text-white/60 group-hover:text-blue-400" />
          </button>

          <div className="flex flex-col items-center">
            <h1 className="text-3xl md:text-5xl font-black tracking-[0.2em] uppercase italic text-center">
              My <span className="text-blue-500 text-glow">Orders</span>
            </h1>
            <div className="h-1.5 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mt-4"></div>
          </div>
        </header>

        {/* --- Rest of the code (orders.length check and map) remains EXACTLY same --- */}
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] rounded-[40px] border border-white/5 backdrop-blur-xl">
            <ShoppingBag className="mx-auto text-white/10 mb-6" size={80} />
            <h2 className="text-xl font-black uppercase tracking-widest text-white/30 italic">No orders history yet bro!</h2>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order._id}
                className={`group transition-all duration-500 rounded-[35px] border ${
                  expandedOrder === order._id ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'bg-white/[0.03] border-white/5 hover:border-white/20'
                } backdrop-blur-md overflow-hidden`}
              >
                {/* Header Clickable */}
                <div 
                  onClick={() => toggleOrder(order._id)}
                  className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl transition-all duration-500 ${expandedOrder === order._id ? 'bg-blue-600 text-white scale-110' : 'bg-white/5 text-blue-500'}`}>
                      <Package size={28} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Transaction ID</p>
                      <p className="text-sm font-bold tracking-widest">#{order._id.slice(-12).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:flex gap-10 md:gap-16">
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Total Amount</p>
                      <p className="text-xl font-black text-blue-500 italic">₹{order.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`h-2 w-2 rounded-full animate-pulse ${order.isPaid ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${order.isPaid ? 'text-green-500' : 'text-yellow-500'}`}>
                          {order.isPaid ? 'Payment Success' : 'Payment Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`hidden md:flex self-center p-3 rounded-full border border-white/10 transition-all duration-500 ${expandedOrder === order._id ? 'rotate-180 bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-white/40'}`}>
                    <ChevronDown size={22} />
                  </div>
                </div>

                {/* Details Section */}
                <div className={`transition-all duration-700 ease-in-out ${expandedOrder === order._id ? 'max-h-[2500px] opacity-100 border-t border-white/10' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                  <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-blue-500">
                        <Tag size={18} />
                        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] italic">Ordered Items</h3>
                      </div>
                      <div className="grid gap-4">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-5 bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group/item">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-black uppercase tracking-tight text-white/90">{item.name}</h4>
                              <p className="text-[11px] text-white/40 font-bold uppercase mt-1">Quantity: <span className="text-blue-400">{item.quantity} {item.unit}</span></p>
                              <p className="text-xs font-black text-white/70 mt-1 italic">₹{item.price} per unit</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-blue-500">
                          <MapPin size={18} />
                          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] italic">Delivery Address</h3>
                        </div>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-2 relative overflow-hidden group/addr">
                           <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 opacity-0 group-hover/addr:opacity-100 transition-all"></div>
                           <p className="text-sm font-black text-white/90 uppercase">{order.address?.fullname}</p>
                           <p className="text-[11px] font-bold text-white/50 leading-relaxed italic uppercase">{order.address?.fullAddress}</p>
                           <p className="text-[11px] text-blue-500 font-black tracking-widest pt-2 uppercase">{order.address?.city} - {order.address?.pincode}</p>
                           <div className="flex items-center gap-2 mt-4 text-white/40 group-hover/addr:text-blue-400 transition-colors">
                              <Smartphone size={14} />
                              <span className="text-[10px] font-black">{order.address?.mobile}</span>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-blue-500">
                          <CreditCard size={18} />
                          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] italic">Payment Summary</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                            <p className="text-[9px] font-black text-white/30 uppercase mb-1">Method</p>
                            <p className="text-xs font-black uppercase tracking-widest text-blue-400">{order.paymentMethod}</p>
                          </div>
                          <div className="bg-white/5 p-5 rounded-3xl border border-white/5 text-right">
                            <p className="text-[9px] font-black text-white/30 uppercase mb-1">Date</p>
                            <p className="text-xs font-black uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="bg-blue-600/20 p-4 rounded-3xl border border-blue-500/20 flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase tracking-widest">Order Status</span>
                           <span className="text-[10px] font-black uppercase bg-blue-600 px-3 py-1 rounded-full">{order.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .text-glow {
          text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}

export default MyOrdersPage;