"use client";
import React from "react";
import { Heart, Plus, Minus, Zap } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { addToCart, increment, decrement } from "@/redux/CartSlice";

interface IGrocery {
  _id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  unit: string;
}

function Grocerycard({
  item,
  highlight = false,
  dataSearchMatch = false,
}: {
  item: IGrocery;
  highlight?: boolean;
  dataSearchMatch?: boolean;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const quantity = useSelector((state: RootState) => {
    const found = state.cart.cartData?.find((i: any) => i._id === item._id);
    return found ? found.quantity : 0;
  });

  const itemId = item._id as any;

  return (
    <div
      data-search-match={dataSearchMatch ? "true" : "false"}
      className={`group relative rounded-2xl p-[1px] overflow-hidden w-full max-w-[280px] aspect-square min-h-[300px] ${
        highlight ? "ring-2 ring-blue-500/70 shadow-[0_0_30px_rgba(59,130,246,0.45)]" : ""
      }`}
    >

      {/* ðŸ”¥ Neon Border Glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-blue-500/40 via-purple-500/30 to-pink-500/40 blur-xl transition-all duration-700 ${
          highlight ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />

      {/* ðŸŒŒ Card Body */}
      <div
        className={`relative z-10 bg-[#0b0b1a]/90 backdrop-blur-xl rounded-2xl border p-4 flex flex-col h-full transition-all duration-500 ${
          highlight ? "border-blue-500/60" : "border-white/10 group-hover:border-blue-500/40"
        }`}
      >

        {/* âš¡ Floating Aura */}
        <div
          className={`absolute -top-24 -right-24 w-56 h-56 bg-blue-600/20 blur-[90px] rounded-full transition-all duration-700 ${
            highlight ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        />

        {/* â¤ï¸ Wishlist */}
        <button className="absolute top-4 right-4 z-20 text-white/20 hover:text-pink-500 transition-all active:scale-125">
          <Heart size={18} fill={quantity > 0 ? "currentColor" : "none"} />
        </button>

        {/* ðŸ–¼ï¸ Image */}
        <div className="relative w-full aspect-square rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="h-28 w-28 object-contain transition-all duration-500 group-hover:scale-125 drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]"
          />

          {quantity > 0 && (
            <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded shadow-lg animate-pulse">
              {quantity} IN CART
            </div>
          )}
        </div>

        {/* ðŸ“ Info */}
        <div className="flex flex-col flex-grow">
          <span className="text-[9px] uppercase tracking-widest text-blue-400 font-bold mb-1">
            {item.category}
          </span>

          <h3 className="text-sm font-bold text-white truncate">
            {item.name}
          </h3>

          <p className="text-[10px] text-white/40 mb-auto">
            {item.unit}
          </p>

          {/* ðŸ’° Price + CTA */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xl font-black text-white tracking-tight">
              ₹{item.price}
            </span>

            {quantity === 0 ? (
              <button
                onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
                className="relative bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[11px] font-black uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.6)] active:scale-95 transition-all"
              >
                <Zap size={16} />
                Add
              </button>
            ) : (
              <div className="flex items-center bg-white/10 rounded-xl p-1 backdrop-blur-lg">
                <button
                  onClick={() => dispatch(decrement(itemId))}
                  className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <Minus size={14} />
                </button>

                <span className="mx-3 text-blue-400 font-black text-xs">
                  {quantity}
                </span>

                <button
                  onClick={() => dispatch(increment(itemId))}
                  className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Grocerycard;
