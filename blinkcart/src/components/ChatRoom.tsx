"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Send, Sparkles } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

type ChatMessage = {
  _id?: string;
  text: string;
  createdAt?: string;
  senderRole?: "user" | "deliveryBoy" | "admin";
  sender?: { _id?: string; name?: string; role?: string };
};

export default function ChatRoom({
  orderId,
  showSuggestions = false,
  className = "",
}: {
  orderId: string;
  showSuggestions?: boolean;
  className?: string;
}) {
  const userId = useSelector((state: RootState) => state.user.userData?._id);
  const userRole = useSelector((state: RootState) => state.user.userData?.role);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`/api/chat/room/${orderId}`);
        if (!active) return;
        setMessages(Array.isArray(data?.messages) ? data.messages : []);
      } catch (err) {
        const message =
          (err as any)?.response?.data?.message ||
          (err as any)?.message ||
          "Unable to load chat";
        setError(message);
        console.error("Chat load error:", message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [orderId]);

  useEffect(() => {
    const socket = getSocket();
    const handler = (payload: { orderId?: string; message?: ChatMessage }) => {
      if (!payload?.orderId || payload.orderId !== orderId) return;
      if (!payload?.message?.text) return;
      setMessages((prev) => {
        if (payload.message?._id && prev.some((m) => m._id === payload.message?._id)) {
          return prev;
        }
        return [...prev, payload.message as ChatMessage];
      });
    };
    socket?.on("chat-message", handler);
    return () => {
      socket?.off("chat-message", handler);
    };
  }, [orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const lastUserMessage = useMemo(() => {
    const found = [...messages].reverse().find((m) => m.senderRole === "user");
    return found?.text || "";
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !orderId) return;
    setSending(true);
    try {
      const { data } = await axios.post("/api/chat/message", {
        orderId,
        text: trimmed,
      });
      if (data?.message) {
        setMessages((prev) => {
          if (data.message?._id && prev.some((m) => m._id === data.message?._id)) {
            return prev;
          }
          return [...prev, data.message];
        });
      }
      setInput("");
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  const requestSuggestions = async () => {
    if (!orderId) return;
    setLoadingSuggestions(true);
    try {
      const { data } = await axios.post("/api/chat/suggestions", {
        orderId,
        lastUserMessage,
      });
      setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
    } catch (err) {
      console.error("Suggestion error:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className={`bg-white/[0.03] border border-white/10 rounded-[24px] ${className}`}>
      <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest">Chat Room</p>
          <p className="text-sm font-bold text-white/90">User & Delivery Partner</p>
        </div>
        {showSuggestions && userRole !== "user" && (
          <button
            onClick={requestSuggestions}
            disabled={loadingSuggestions}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-xl bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/30 disabled:opacity-60"
          >
            <Sparkles size={12} />
            {loadingSuggestions ? "Thinking..." : "AI Suggestions"}
          </button>
        )}
      </div>

      <div className="p-4 md:p-5 space-y-3 max-h-[320px] overflow-y-auto">
        {loading ? (
          <div className="text-white/40 text-xs">Loading messages...</div>
        ) : error ? (
          <div className="text-red-300 text-xs">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-white/30 text-xs">No messages yet. Say hello.</div>
        ) : (
          messages.map((msg, idx) => {
            const mine =
              userId && msg?.sender?._id
                ? String(msg.sender._id) === String(userId)
                : msg.senderRole === userRole;
            return (
              <div
                key={msg._id || idx}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    mine
                      ? "bg-blue-500/20 text-blue-100 border border-blue-400/30"
                      : "bg-white/5 text-white/80 border border-white/10"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-[9px] text-white/40 mt-1">
                    {msg.sender?.name ? msg.sender.name : msg.senderRole}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="px-4 md:px-5 pb-2 flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={`${s}-${i}`}
              onClick={() => sendMessage(s)}
              className="text-[11px] px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-200 border border-emerald-500/20 hover:bg-emerald-500/20"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="p-4 md:p-5 border-t border-white/10 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-black/30 border border-white/10 rounded-2xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500/50"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="px-4 py-2 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-60"
        >
          <Send size={14} />
          Send
        </button>
      </form>
    </div>
  );
}
