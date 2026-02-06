"use client";

import React, { useState, ChangeEvent, useRef } from "react"; // 1. useRef add kiya
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; // 2. Toaster import
import { 
  PlusCircle, Upload, IndianRupee, Tag, Layers, 
  Apple, Leaf, Trash2, Check, ArrowLeft 
} from "lucide-react";

const CATEGORIES = [
  "Fruits & Vegetables", 
  "Dairy, Bread & Eggs", 
  "Snacks & Munchies", 
  "Cold Drinks & Juices",
  "Instant & Frozen Food",
  "Tea, Coffee & Health Drinks",
  "Bakery & Biscuits",
  "Sweet Tooth (Chocolates & Ice Cream)",
  "Chicken, Meat & Fish",
  "Cleaning & Household Essentials"
];

export default function AddGrocery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Form reset ke liye reference
  const formRef = useRef<HTMLFormElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validations with Toasts
    if (!selectedCategory) return toast.error("Bhai, category toh select kar le!");
    if (!imageFile) return toast.error("Photo ke bina grocery kaisi?");

    setLoading(true);
    const toastId = toast.loading("Adding grocery to store..."); // Loading start

    const formData = new FormData(e.currentTarget);
    formData.append("category", selectedCategory);

    try {
      const response = await axios.post("/api/admin/grocery-add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201 || response.status === 200) {
        // ✅ Success Toast
        toast.success("Mubarak ho! Grocery add ho gayi 🔥", { id: toastId });

        // 🧼 FORM RESET LOGIC (SAB KHALI)
        formRef.current?.reset(); // Inputs khali
        setPreview(null);         // Image preview khatam
        setSelectedCategory("");  // Category button reset
        setImageFile(null);       // File state reset
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Kuch locha ho gaya!";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] pt-24 pb-10 px-4 relative overflow-hidden text-white">
      {/* 3. Toaster Container (Design settings) */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: { background: '#111', color: '#fff', border: '1px solid #333' }
        }} 
      />

      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="group flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl transition-all">
          <ArrowLeft size={20} className="text-blue-500" />
          <span className="text-xs font-black uppercase">Go Back</span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-black italic">ADD NEW <span className="text-blue-500">GROCERY</span></h1>
        </header>

        {/* Form Ref attach kiya yahan */}
        <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            {/* Image Box */}
            <div className="relative h-[420px] border-2 border-dashed border-white/10 rounded-[3.5rem] flex flex-col items-center justify-center overflow-hidden bg-white/[0.03]">
              {preview ? (
                <div className="relative w-full h-full">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => {setPreview(null); setImageFile(null);}}
                    className="absolute top-6 right-6 p-4 bg-red-600 rounded-2xl z-40"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={32} className="mx-auto mb-5 text-blue-400" />
                  <p className="font-bold uppercase tracking-tighter">Upload Photo</p>
                </div>
              )}
              <input name="image" type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-30" />
            </div>

            {/* Category Selection */}
            <div className="bg-white/[0.04] p-7 rounded-[2.5rem]">
              <h3 className="text-[10px] font-black uppercase text-blue-400 mb-5 flex items-center gap-2">
                <Check size={14} /> Step 1: Choose Category
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border 
                      ${selectedCategory === cat ? "bg-blue-600 border-blue-400 text-white" : "bg-white/5 border-white/5 text-gray-500"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 p-10 rounded-[3.5rem] space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase text-gray-400">Item Title</label>
              <div className="relative">
                <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                <input name="name" required type="text" placeholder="Fresh Mangoes" className="w-full bg-white/[0.05] border border-white/10 py-5 pl-14 pr-4 rounded-3xl outline-none focus:border-blue-500 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-gray-400">Price (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                  <input name="price" required type="number" placeholder="80" className="w-full bg-white/[0.05] border border-white/10 py-5 pl-14 pr-4 rounded-3xl outline-none focus:border-blue-500 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-gray-400">Unit (kg/pc/pkt)</label>
                <div className="relative">
                  <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                  <input name="unit" required type="text" placeholder="1 kg" className="w-full bg-white/[0.05] border border-white/10 py-5 pl-14 pr-4 rounded-3xl outline-none focus:border-blue-500 text-white" />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-6 rounded-[2rem] font-black text-xs tracking-[0.4em] flex items-center justify-center gap-4 transition-all active:scale-95
                ${loading ? "bg-gray-700 cursor-not-allowed opacity-50" : "bg-gradient-to-r from-blue-700 to-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"}`}
            >
              <PlusCircle size={22} className={loading ? "animate-spin" : ""} />
              {loading ? "ADDING..." : "ADD TO STORE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}