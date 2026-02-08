"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, ShoppingCart, User as UserIcon, X, ShoppingBag,
  LogOut, Package, ChevronDown, PlusCircle, LayoutDashboard,
  Settings2, Menu, History, Settings, Home
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { RootState } from "@/redux/store";

interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
}

function Nav({ user }: { user: IUser }) {
  const cartData = useSelector((state: RootState) => state.cart.cartData || []);
  const uniqueItemsCount = cartData.length;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = searchParams?.get("q") || "";
    setSearchText(q);
  }, [searchParams]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (isAdmin) return;
    const handle = setTimeout(() => {
      const q = searchText.trim();
      if (!q) {
        router.replace("/");
        return;
      }
      router.replace(`/?q=${encodeURIComponent(q)}`);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchText, router, isAdmin]);

  return (
    <>
      <div className="fixed top-4 left-0 right-0 z-[100] px-4 pointer-events-none">
        <nav className="max-w-7xl mx-auto px-6 py-4 rounded-[2rem] border border-white/10 bg-[#0a0a1a]/80 backdrop-blur-2xl shadow-2xl relative pointer-events-auto">
          
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[2rem]">
            <div className="absolute top-[-50%] left-[-10%] w-[30%] h-[200%] bg-purple-600/10 blur-[60px] rounded-full" />
            <div className="absolute top-[-50%] right-[-10%] w-[30%] h-[200%] bg-blue-600/10 blur-[60px] rounded-full" />
          </div>

          <div className="relative z-10 flex items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="p-2.5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl group-hover:border-blue-500/20 transition-all">
                 <ShoppingBag className="text-blue-400" size={22} />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-white font-extrabold text-xl tracking-tight leading-none italic">
                  Blink<span className="text-blue-500">Cart</span>
                </span>
                <span className="text-[10px] text-white/30 font-medium tracking-widest uppercase">
                  {isAdmin ? "Admin Console" : "Grocery Express"}
                </span>
              </div>
            </Link>

            {/* Desktop Center Links */}
            <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
              {isAdmin ? (
                <>
                  <Link href="/admin/grocery-add" className="text-white/60 hover:text-blue-400 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <PlusCircle size={14}/> Add Grocery
                  </Link>
                  <Link href="/admin/view-grocery" className="text-white/60 hover:text-blue-400 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <LayoutDashboard size={14}/> View Grocery
                  </Link>
                  <Link href="/admin/managegrocery" className="text-white/60 hover:text-blue-400 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Settings2 size={14}/> Manage
                  </Link>
                </>
              ) : (
                <form onSubmit={submitSearch} className="flex-1 max-w-sm relative group">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-[1.5rem] py-2.5 pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 transition-all text-sm"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500" size={18} />
                </form>
              )}
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-3">
              {!isAdmin && (
                <Link href="/user/cart" className="relative p-3 text-white/60 bg-white/[0.05] border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                  <ShoppingCart size={20} />
                  {uniqueItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0a0a1a] text-white">
                      {uniqueItemsCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 text-white bg-blue-600 rounded-2xl shadow-lg active:scale-95">
                <Menu size={20} />
              </button>

              {/* Desktop Profile Dropdown */}
              <div className="hidden lg:block relative" ref={dropdownRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-1 pr-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/10 transition-all cursor-pointer">
                   <div className="w-9 h-9 rounded-xl overflow-hidden bg-blue-500/20 flex items-center justify-center border border-white/10">
                      {user?.image ? <img src={user.image} alt="User" className="w-full h-full object-cover" /> : <UserIcon size={18} className="text-white/40" />}
                   </div>
                   <ChevronDown size={14} className={`text-white/30 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="absolute right-0 mt-4 w-56 bg-[#0d0d21]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-3 shadow-2xl z-[110]">
                      <div className="p-4 mb-2 border-b border-white/5">
                        <p className="text-white font-bold text-sm truncate">{user?.name}</p>
                        {/* ðŸ”¥ Bolder Email in Dropdown */}
                        <p className="text-white/70 text-[10px] truncate mb-1 font-bold">{user?.email}</p>
                        <p className="text-blue-500 text-[9px] uppercase font-black tracking-widest">{user?.role}</p>
                      </div>
                      <div className="space-y-1">
                        {!isAdmin && (
                          <Link href="/user/myorder" className="flex items-center gap-3 w-full p-2.5 text-white/60 hover:text-blue-400 hover:bg-white/5 rounded-xl transition-all font-bold text-sm">
                            <History size={18} /> My Orders
                          </Link>
                        )}
                        <button onClick={() => signOut()} className="flex items-center gap-3 w-full p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm">
                          <LogOut size={18} /> Log Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* --- MOBILE SIDEBAR --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[200]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="absolute right-0 top-0 bottom-0 w-80 bg-[#0a0a1a] border-l border-white/10 p-8 flex flex-col">
              
              {/* Mobile Sidebar Header */}
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-black italic tracking-tighter text-blue-500">BLINKCART</span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white/5 rounded-xl text-white/50"><X size={20}/></button>
              </div>

              {/* ðŸ”¥ User Info in Sidebar (Mobile View) */}
              <div className="mb-10 p-5 bg-white/[0.03] border border-white/10 rounded-[2rem] flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-blue-500/20 flex items-center justify-center border border-blue-500/30 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  {user?.image ? <img src={user.image} alt="User" className="w-full h-full object-cover" /> : <UserIcon size={30} className="text-blue-400" />}
                </div>
                <h3 className="text-white font-black text-lg leading-tight uppercase tracking-tight">{user?.name}</h3>
                <p className="text-white/60 text-xs font-bold mb-2 break-all px-2">{user?.email}</p>
                <span className="px-4 py-1 bg-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                  {user?.role}
                </span>
              </div>

              <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-2">
                {isAdmin ? (
                  <>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">Admin Actions</p>
                    <Link href="/admin/grocery-add" className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl text-sm font-bold border border-white/5 hover:border-blue-500/30 transition-all"><PlusCircle size={20} className="text-blue-500"/> Add Grocery</Link>
                    <Link href="/admin/view-grocery" className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl text-sm font-bold border border-white/5 hover:border-blue-500/30 transition-all"><LayoutDashboard size={20} className="text-blue-500"/> View Grocery</Link>
                    <Link href="/admin/managegrocery" className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl text-sm font-bold border border-white/5 hover:border-blue-500/30 transition-all"><Settings2 size={20} className="text-blue-500"/> Manage</Link>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">Main Menu</p>
                    <Link href="/" className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl text-sm font-bold border border-white/5 hover:border-blue-500/30 transition-all"><Home size={20} className="text-blue-500"/> Home</Link>
                    <Link href="/user/myorder" className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl text-sm font-bold border border-white/5 hover:border-blue-500/30 transition-all"><History size={20} className="text-blue-500"/> My Orders</Link>
                    <Link href="/user/cart" className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl text-sm font-bold border border-white/5 hover:border-blue-500/30 transition-all"><ShoppingCart size={20} className="text-blue-500"/> My Cart</Link>
                  </>
                )}
                
                <div className="mt-auto pt-8 border-t border-white/5">
                  <button onClick={() => signOut()} className="flex items-center gap-4 p-4 w-full bg-red-500/10 text-red-500 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
                    <LogOut size={20}/> Log Out
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Nav;
