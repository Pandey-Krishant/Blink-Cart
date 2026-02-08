"use client";
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { increment, decrement } from '@/redux/CartSlice';
import { Plus, Minus, ChevronRight, Home, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Backgroundicons from '@/components/Backgroundicons';

// Interface define kar lo bro taaki red lines ka jhanjhat hi khatam ho jaye
interface CartItem {
  _id: string;
  name: string;
  price: number | string;
  image: string;
  quantity: number;
  unit: string;
}

function CartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  // Cast kar diya taaki TypeScript ko pata rahe ki ye CartItem ki array hai
  const cartData = useSelector((state: RootState) => state.cart.cartData) as CartItem[];

  const itemTotal = cartData.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const deliveryFee = itemTotal > 0 ? 40 : 0;
  const totalToPay = itemTotal + deliveryFee;

  const handleProceed = () => {
    if (cartData.length > 0) {
      router.push('/user/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b1a] text-white p-6 md:p-12 relative overflow-hidden">
      <Backgroundicons />
    
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10 relative z-10">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            My <span className="text-blue-500">Basket</span> ({cartData.length})
          </h1>
        </div>
        <Link href="/" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all text-xs font-bold tracking-widest uppercase">
          <Home size={14} /> Home
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
        
        <div className="lg:col-span-2 space-y-4">
          {cartData.length > 0 ? (
            cartData.map((item) => (
              <div key={item._id} className="relative group flex items-center bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:border-blue-500/30 transition-all overflow-hidden">
                <div className="w-24 h-24 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 overflow-hidden">
                   <img src={item.image} alt={item.name} className="w-16 h-16 object-contain group-hover:scale-110 transition-transform" />
                </div>

                <div className="ml-6 flex-grow">
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  <p className="text-xs text-white/40 uppercase font-black">{item.unit}</p>
                  <p className="text-xl font-black text-blue-500 mt-1">â‚¹{item.price}</p>
                </div>

                <div className="flex items-center bg-blue-600 rounded-xl p-1 shadow-lg shadow-blue-600/20">
                  <button 
                    onClick={() => dispatch(decrement(item._id))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Minus size={16} strokeWidth={3} />
                  </button>
                  <span className="mx-4 font-black text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => dispatch(increment(item._id))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
              <ShoppingBag size={48} className="mx-auto text-white/10 mb-4" />
              <p className="text-white/30 font-bold uppercase tracking-widest">Your basket is empty, bro!</p>
              <Link href="/" className="mt-4 inline-block text-blue-500 font-black underline uppercase text-xs">Start Shopping</Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl sticky top-10 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full" />
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 italic uppercase">
              Bill Details <ChevronRight size={18} className="text-blue-500" />
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-white/60 font-bold uppercase">
                <span>Subtotal</span>
                <span className="text-white">â‚¹{itemTotal}</span>
              </div>
              <div className="flex justify-between text-white/60 font-bold uppercase">
                <span>Delivery Partner Fee</span>
                <span className="text-white">â‚¹{deliveryFee}</span>
              </div>
              
              <hr className="border-white/5 my-4" />

              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Total Amount</span>
                <span className="text-4xl font-black text-white tracking-tighter">â‚¹{totalToPay}</span>
              </div>

              <button 
                onClick={handleProceed}
                disabled={cartData.length === 0}
                className="w-full mt-8 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/20 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-600/30"
              >
                Proceed to Checkout <ChevronRight size={20} strokeWidth={4} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
