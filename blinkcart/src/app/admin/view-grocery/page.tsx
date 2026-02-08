"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Search,
  Trash2,
  X,
  Package,
  Tag,
  IndianRupee,
  ChevronDown,
} from "lucide-react";
import BackgroundIcons from "@/components/Backgroundicons";

type GroceryItem = {
  _id: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
  createdAt?: string;
};

const categories = [
  "Fruits & Vegetables",
  "Dairy, Bread & Eggs",
  "Snacks & Munchies",
  "Cold Drinks & Juices",
  "Instant & Frozen Food",
  "Tea, Coffee & Health Drinks",
  "Bakery & Biscuits",
  "Sweet Tooth (Chocolates & Ice Cream)",
  "Chicken, Meat & Fish",
  "Cleaning & Household Essentials",
];

export default function ViewGrocery() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<GroceryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get<GroceryItem[]>("/api/admin/groceries");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("View grocery fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }, [items, search]);

  const startEdit = (item: GroceryItem) => {
    setEditing({ ...item });
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const saveEdit = async () => {
    if (!editing?._id) return;
    setSaving(true);
    try {
      const payload = {
        name: editing.name,
        category: editing.category,
        price: editing.price,
        unit: editing.unit,
        image: editing.image,
      };
      const res = await axios.patch<GroceryItem>(
        `/api/admin/groceries/${editing._id}`,
        payload
      );
      setItems((prev) =>
        prev.map((i) => (i._id === editing._id ? res.data : i))
      );
      setEditing(null);
    } catch (err) {
      console.error("Edit grocery error:", err);
      alert("Failed to update grocery");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!id) return;
    const ok = window.confirm("Delete this grocery item?");
    if (!ok) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/admin/groceries/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      console.error("Delete grocery error:", err);
      alert("Failed to delete grocery");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white p-4 md:p-10 relative overflow-hidden">
      <BackgroundIcons />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-emerald-600/10 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
              View <span className="text-blue-500 text-shadow-glow">Grocery</span>
            </h1>
            <p className="text-white/40 text-xs uppercase font-black tracking-[0.3em] mt-2">
              Live Inventory â€¢ {items.length} items
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or category..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-5 text-sm outline-none focus:border-blue-500/40 transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center text-white/40 font-bold">
            Loading inventory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-white/30 font-bold border border-dashed border-white/10 rounded-[3rem]">
            No grocery items found
          </div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {filtered.map((item) => {
                const isOpen = expandedId === item._id;
                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-[2rem] border transition-all duration-500 backdrop-blur-xl ${
                      isOpen
                        ? "bg-blue-600/10 border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                        : "bg-white/[0.03] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div
                      onClick={() => toggleExpand(item._id)}
                      className="p-5 md:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={28} className="text-white/40" />
                          )}
                        </div>
                        <div>
                          <p className="text-[9px] text-white/30 uppercase font-black tracking-[0.3em]">
                            Grocery Item
                          </p>
                          <p className="text-lg font-black tracking-tight text-white">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">
                            <Tag size={12} className="text-blue-400" />
                            {item.category}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[9px] text-white/30 uppercase font-black tracking-[0.3em]">
                            Price
                          </p>
                          <p className="text-white font-black text-lg flex items-center gap-1 justify-end">
                            <IndianRupee size={16} className="text-emerald-400" />
                            {item.price}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {item.unit}
                        </span>
                        <div
                          className={`p-2.5 rounded-full border transition-all duration-500 ${
                            isOpen
                              ? "rotate-180 bg-blue-600 text-white border-blue-500/40"
                              : "bg-white/5 text-white/40 border-white/10"
                          }`}
                        >
                          <ChevronDown size={18} />
                        </div>
                      </div>
                    </div>

                    <div
                      className={`transition-all duration-700 ease-in-out ${
                        isOpen
                          ? "max-h-[600px] opacity-100 border-t border-white/10"
                          : "max-h-0 opacity-0 pointer-events-none"
                      }`}
                    >
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                            Details
                          </p>
                          <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-2">
                            <p className="text-white/70 text-xs">
                              Category: <span className="text-white">{item.category}</span>
                            </p>
                            <p className="text-white/70 text-xs">
                              Unit: <span className="text-white">{item.unit}</span>
                            </p>
                            <p className="text-white/70 text-xs">
                              ID: <span className="text-white/60">{item._id}</span>
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                            Actions
                          </p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(item);
                              }}
                              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-blue-400 hover:border-blue-500/30 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
                            >
                              <Edit3 size={14} /> Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteItem(item._id);
                              }}
                              disabled={deletingId === item._id}
                              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-60"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && setEditing(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            >
              <div className="w-full max-w-xl bg-[#0b0b1a] border border-white/10 rounded-[2rem] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Edit Grocery</p>
                    <p className="text-white font-black text-lg">Update item details</p>
                  </div>
                  <button
                    onClick={() => !saving && setEditing(null)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    placeholder="Name"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-blue-500/40"
                  />
                  <select
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="w-full bg-[#0b0b1a] border border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-blue-500/40"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className="bg-[#0b0b1a]">
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      value={editing.price}
                      onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                      placeholder="Price"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-blue-500/40"
                    />
                    <input
                      value={editing.unit}
                      onChange={(e) => setEditing({ ...editing, unit: e.target.value })}
                      placeholder="Unit (e.g. 1kg)"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-blue-500/40"
                    />
                  </div>
                  <input
                    value={editing.image}
                    onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                    placeholder="Image URL"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-blue-500/40"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => setEditing(null)}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        .text-shadow-glow {
          text-shadow: 0 0 30px rgba(59, 130, 246, 0.35);
        }
      `}</style>

      <footer className="mt-16 text-center text-white/30 text-[10px] uppercase font-black tracking-[0.4em]">
        Crafted for BlinkCart Ops â€¢ Live Grocery Control â€¢ Developer~Krishant Pandey
      </footer>
    </div>
  );
}
