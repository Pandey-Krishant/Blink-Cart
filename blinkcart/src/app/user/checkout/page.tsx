"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import axios from 'axios';
import { 
  ChevronLeft, MapPin, User, Phone as PhoneIcon, 
  Smartphone, CreditCard, Truck 
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Backgroundicons from '@/components/Backgroundicons';
import { useRouter } from 'next/navigation';

const MapComponent = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-white/20">Loading Tracker...</div>
});

function CheckoutPage() {
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.user);
  const { cartData } = useSelector((state: RootState) => state.cart);

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    city: "",
    pincode: "",
    fullAddress: ""
  });

  const subtotal = cartData.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;

  // --- Main Logic Starts Here ---
  const handleConfirmOrder = async () => {
    if (!userData?._id) return alert("Bro, login toh kar le!");
    if (!address.fullAddress || !address.city) return alert("Address fill karo pehle!");
    if (cartData.length === 0) return alert("Cart khali hai bro!");

    try {
      setLoading(true);
      
      const orderPayload = {
        userId: userData._id,
        items: cartData.map(item => ({
          grocery: item._id,
          name: item.name,
          price: String(item.price),
          unit: item.unit || "unit",
          image: item.image,
          quantity: item.quantity
        })),
        paymentMethod: paymentMethod, 
        address: {
          fullname: userData.name || "Customer",
          city: address.city,
          state: "Delhi", 
          mobile: userData.mobile || "0000000000",
          pincode: address.pincode,
          fullAddress: address.fullAddress,
          latitude: "0",
          longitude: "0"
        },
        totalAmount: total
      };

      // ✅ Response handle karne ka sahi tarika
      const response = await axios.post('/api/user/paymentstripe', orderPayload);
      const data = response.data;

      // 🚨 STRIPE REDIRECT logic
      if (paymentMethod === 'card' && data.url) {
          window.location.href = data.url; // Assign ki jagah .href zyada reliable hai
          return;
      }

      // COD ya 201 status ke liye
      if (response.status === 201 || response.status === 200) {
        router.push('/user/sucess'); 
      }

    } catch (error: any) {
      console.error("Order error:", error);
      const errorMessage = error.response?.data?.message || "Order fail ho gaya bro!";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = useCallback(async (lat: number, lon: number) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: { format: 'json', lat, lon, addressdetails: 1 }
      });
      const data = response.data;
      if (data && data.address) {
        setAddress({
          city: data.address.city || data.address.suburb || data.address.town || "",
          pincode: data.address.postcode || "",
          fullAddress: data.display_name || ""
        });
      }
    } catch (err) {
      console.error("Geocoding Error:", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        handleLocationChange(pos.coords.latitude, pos.coords.longitude);
      }, (err) => console.log("Geo error:", err));
    }
  }, [handleLocationChange]);

  return (
    <div className="min-h-screen bg-[#0b0b1a] text-white p-6 md:p-12 relative overflow-hidden">
      <Backgroundicons />
      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/user/cart" className="flex items-center gap-2 text-white/50 hover:text-blue-500 transition-colors group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Back to Cart</span>
          </Link>
          <h1 className="text-2xl font-black tracking-[0.2em] uppercase italic">Check<span className="text-blue-500">out</span></h1>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Side: Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500"><MapPin size={24} /></div>
                <h2 className="text-xl font-black italic uppercase">Delivery Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/40 ml-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input type="text" readOnly value={userData?.name || ""} className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 pl-12 outline-none cursor-not-allowed opacity-70" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/40 ml-2">Mobile</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input type="text" readOnly value={userData?.mobile || ""} className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 pl-12 outline-none cursor-not-allowed opacity-70" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/40 ml-2">Full Address</label>
                  <textarea rows={2} value={address.fullAddress} onChange={(e) => setAddress({...address, fullAddress: e.target.value})} className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 resize-none transition-all" />
                </div>

                <div className="space-y-2">
                  <input type="text" placeholder="City" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/30" />
                </div>
                <div className="space-y-2">
                  <input type="text" placeholder="Pincode" value={address.pincode} onChange={(e) => setAddress({...address, pincode: e.target.value})} className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/30" />
                </div>

                <div className="md:col-span-2 mt-4">
                   <div className="h-80 w-full rounded-3xl overflow-hidden border border-white/10 shadow-inner">
                      <MapComponent onLocationChange={handleLocationChange} />
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Payment & Summary */}
          <div className="space-y-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl sticky top-6">
              <h2 className="text-xl font-black italic mb-8 uppercase text-blue-500">Payment Method</h2>
              
              <div className="space-y-4">
                {[
                  { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard size={18} /> },
                  { id: 'cod', name: 'Cash on Delivery', icon: <Truck size={18} /> },
                  { id: 'upi', name: 'UPI / PhonePe', icon: <Smartphone size={18} /> }
                ].map((m) => (
                  <div 
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${paymentMethod === m.id ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex items-center gap-4 uppercase font-bold text-[10px] tracking-widest">
                      <div className={paymentMethod === m.id ? 'text-blue-500' : 'text-white/40'}>{m.icon}</div>
                      {m.name}
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 transition-all ${paymentMethod === m.id ? 'border-blue-500 bg-blue-500 scale-110' : 'border-white/20'}`} />
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 space-y-4">
                <div className="flex justify-between text-white/40 font-bold text-[10px] uppercase"><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between text-white/40 font-bold text-[10px] uppercase"><span>Delivery</span><span>₹{deliveryFee}</span></div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-[10px] font-black text-blue-500 italic uppercase">GRAND TOTAL</span>
                  <span className="text-3xl font-black tracking-tighter text-white">₹{total}</span>
                </div>
                
                <button 
                  onClick={handleConfirmOrder}
                  disabled={loading || cartData.length === 0}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="group-hover:tracking-[0.3em] transition-all">
                    {loading ? 'Processing...' : 'Confirm Order'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;