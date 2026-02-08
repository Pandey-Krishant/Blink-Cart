 "use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity,
  BadgeCheck,
  Clock,
  CreditCard,
  Package,
  RefreshCcw,
  Truck,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BackgroundIcons from "./Backgroundicons";
import { getSocket } from "@/lib/socket";

const allStatuses = [
  "pending",
  "confirmed",
  "shipped",
  "out for delivery",
  "delivered",
  "cancelled",
] as const;

type OrderStatus = (typeof allStatuses)[number];

type Address = {
  fullname: string;
  mobile: string;
  fullAddress: string;
  city: string;
  state: string;
  pincode: string;
};

type OrderItem = {
  image: string;
  name: string;
  quantity: number;
  price: number | string;
};

type AssignedUser = {
  _id?: string;
  name?: string;
  mobile?: string;
};

type Assignment = {
  _id?: string;
  status?: string;
  assignedTo?: AssignedUser | string | null;
};

type Order = {
  _id: string;
  status?: OrderStatus;
  address?: Address;
  items?: OrderItem[];
  paymentMethod: string;
  isPaid: boolean;
  totalAmount: number;
  assignment?: Assignment | string | null;
  createdAt?: string | Date;
};

type ActivityItem = {
  id: string;
  type: "new" | "status" | "assigned";
  title: string;
  meta: string;
  at: string;
};

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatMoney(value: number) {
  return `₹${value.toFixed(0)}`;
}

function getStatusColor(status?: OrderStatus) {
  switch (status) {
    case "pending":
      return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    case "confirmed":
      return "text-purple-400 bg-purple-400/10 border-purple-400/20";
    case "shipped":
      return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    case "out for delivery":
      return "text-orange-400 bg-orange-400/10 border-orange-400/20";
    case "delivered":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "cancelled":
      return "text-red-400 bg-red-400/10 border-red-400/20";
    default:
      return "text-white/50 bg-white/5 border-white/10";
  }
}

const statusColors: Record<OrderStatus, string> = {
  pending: "#fbbf24",
  confirmed: "#a855f7",
  shipped: "#60a5fa",
  "out for delivery": "#fb923c",
  delivered: "#34d399",
  cancelled: "#f87171",
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [pulse, setPulse] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Order[]>("/api/admin/managegrocery");
      const list = Array.isArray(res.data) ? res.data : [];
      setOrders(list);
      setLastSync(new Date());
    } catch (err) {
      console.error("AdminDashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const pushActivity = (item: ActivityItem) => {
      setActivity((prev) => [item, ...(prev ?? [])].slice(0, 6));
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    };

    const handleNewOrder = (newOrder: Order) => {
      const normalized: Order = {
        ...newOrder,
        _id: String(newOrder._id),
      };
      setOrders((prev) => {
        const list = prev ?? [];
        const exists = list.some((o) => String(o._id) === normalized._id);
        if (exists) {
          return list.map((o) =>
            String(o._id) === normalized._id ? normalized : o
          );
        }
        return [normalized, ...list];
      });
      pushActivity({
        id: `new-${normalized._id}`,
        type: "new",
        title: "New order received",
        meta: `Order #${String(normalized._id).slice(-6).toUpperCase()}`,
        at: formatTime(new Date()),
      });
    };

    const handleStatusUpdate = (payload: {
      orderId: string;
      status: OrderStatus;
      order?: Order;
    }) => {
      if (!payload?.orderId) return;
      setOrders((prev) =>
        (prev ?? []).map((o) =>
          String(o._id) === String(payload.orderId)
            ? { ...o, ...(payload.order ?? {}), status: payload.status }
            : o
        )
      );
      pushActivity({
        id: `status-${payload.orderId}-${payload.status}`,
        type: "status",
        title: "Status updated",
        meta: `Order #${String(payload.orderId).slice(-6).toUpperCase()} â€¢ ${payload.status}`,
        at: formatTime(new Date()),
      });
    };

    const handleAssignmentAccepted = (payload: {
      orderId: string;
      assignmentId: string;
      status?: string;
      assignedTo?: AssignedUser | null;
    }) => {
      if (!payload?.orderId) return;
      const assignment: Assignment = {
        _id: payload.assignmentId,
        status: payload.status,
        assignedTo: payload.assignedTo ?? null,
      };
      setOrders((prev) =>
        (prev ?? []).map((o) =>
          String(o._id) === String(payload.orderId)
            ? { ...o, assignment }
            : o
        )
      );
      pushActivity({
        id: `assign-${payload.orderId}-${payload.assignmentId}`,
        type: "assigned",
        title: "Delivery assigned",
        meta: `Order #${String(payload.orderId).slice(-6).toUpperCase()}`,
        at: formatTime(new Date()),
      });
    };

    socket?.on("new-Order", handleNewOrder);
    socket?.on("order-status-updated", handleStatusUpdate);
    socket?.on("delivery-assignment-accepted", handleAssignmentAccepted);
    return () => {
      socket?.off("new-Order", handleNewOrder);
      socket?.off("order-status-updated", handleStatusUpdate);
      socket?.off("delivery-assignment-accepted", handleAssignmentAccepted);
    };
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const revenue = orders
      .filter((o) => o.isPaid || o.paymentMethod === "cod")
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const pending = orders.filter((o) => o.status === "pending").length;
    const outForDelivery = orders.filter((o) => o.status === "out for delivery").length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const assigned = orders.filter((o) => {
      if (typeof o.assignment === "object" && o.assignment) {
        return Boolean(o.assignment.assignedTo);
      }
      return false;
    }).length;
    return { totalOrders, revenue, pending, outForDelivery, delivered, assigned };
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bd - ad;
      })
      .slice(0, 6);
  }, [orders]);

  const revenueByDay = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const buckets = Array.from({ length: 7 }, (_, i) => ({
      day: days[i],
      value: 0,
    }));
    orders.forEach((o) => {
      if (!(o.isPaid || o.paymentMethod === "cod")) return;
      const created = o.createdAt ? new Date(o.createdAt) : null;
      if (!created || Number.isNaN(created.getTime())) return;
      const idx = created.getDay();
      buckets[idx].value += Number(o.totalAmount || 0);
    });
    const max = Math.max(1, ...buckets.map((b) => b.value));
    return { buckets, max };
  }, [orders]);

  const statusBreakdown = useMemo(() => {
    const total = Math.max(1, orders.length);
    const byStatus = allStatuses.map((s) => ({
      status: s,
      count: orders.filter((o) => o.status === s).length,
    }));
    return {
      total,
      byStatus,
    };
  }, [orders]);

  const statusPie = useMemo(() => {
    const total = statusBreakdown.total;
    if (total === 0) {
      return "conic-gradient(#1f2937 0% 100%)";
    }
    let acc = 0;
    const stops = statusBreakdown.byStatus.map((row) => {
      const color = statusColors[row.status as OrderStatus] || "#94a3b8";
      const start = acc;
      const size = (row.count / total) * 100;
      acc += size;
      return `${color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [statusBreakdown]);

  return (
    <div className="min-h-screen bg-[#050510] pt-24 pb-10 px-4 sm:px-8 overflow-x-hidden">
      <BackgroundIcons />
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
                Admin <span className="text-blue-500 text-shadow-glow">Command</span>
              </h1>
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  pulse ? "bg-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.9)]" : "bg-white/30"
                }`}
              />
            </div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mt-2">
              Live sync â€¢ {lastSync ? `Last sync ${formatTime(lastSync)}` : "Connecting..."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-blue-400 transition-all active:scale-90"
            >
              <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="bg-[#0a0a1a]/80 border border-white/10 rounded-[1.75rem] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                Total Orders
              </p>
              <Package size={18} className="text-blue-400" />
            </div>
            <p className="text-3xl font-black text-white mt-4">{stats.totalOrders}</p>
          </div>
          <div className="bg-[#0a0a1a]/80 border border-white/10 rounded-[1.75rem] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                Revenue
              </p>
              <CreditCard size={18} className="text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-white mt-4">{formatMoney(stats.revenue)}</p>
          </div>
          <div className="bg-[#0a0a1a]/80 border border-white/10 rounded-[1.75rem] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                Pending
              </p>
              <Clock size={18} className="text-amber-400" />
            </div>
            <p className="text-3xl font-black text-white mt-4">{stats.pending}</p>
          </div>
          <div className="bg-[#0a0a1a]/80 border border-white/10 rounded-[1.75rem] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                Out For Delivery
              </p>
              <Truck size={18} className="text-orange-400" />
            </div>
            <p className="text-3xl font-black text-white mt-4">{stats.outForDelivery}</p>
          </div>
          <div className="bg-[#0a0a1a]/80 border border-white/10 rounded-[1.75rem] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                Assigned
              </p>
              <BadgeCheck size={18} className="text-purple-400" />
            </div>
            <p className="text-3xl font-black text-white mt-4">{stats.assigned}</p>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="xl:col-span-2 bg-[#0a0a1a]/80 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">
                <Activity size={14} className="text-blue-400" /> Recent Orders
              </div>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="py-10 text-center text-white/30 font-bold">
                  Syncing live data...
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="py-10 text-center text-white/30 font-bold">
                  No orders yet
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between gap-4 bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 hover:border-blue-500/30 transition-all"
                  >
                    <div>
                      <p className="text-white font-black text-sm tracking-tight">
                        #{String(order._id).slice(-6).toUpperCase()}
                      </p>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                        {order.address?.fullname || "Anonymous"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status || "pending"}
                      </span>
                      <span className="text-white font-black text-sm">
                        {formatMoney(Number(order.totalAmount || 0))}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="bg-[#0a0a1a]/80 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              <User size={14} className="text-purple-400" /> Live Activity
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {activity.length === 0 ? (
                  <div className="py-10 text-center text-white/30 font-bold">
                    Waiting for events...
                  </div>
                ) : (
                  activity.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3"
                    >
                      <p className="text-white font-black text-xs uppercase tracking-widest">
                        {item.title}
                      </p>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
                        {item.meta}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest">
                        <Clock size={12} /> {item.at}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-[#0a0a1a]/80 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">
                <Activity size={14} className="text-emerald-400" /> Revenue (Paid)
              </div>
              <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                Weekly
              </span>
            </div>
            <div className="grid grid-cols-7 gap-3 items-end h-40">
              {revenueByDay.buckets.map((b) => {
                const height = Math.max(
                  8,
                  Math.round((b.value / revenueByDay.max) * 140)
                );
                return (
                  <div key={b.day} className="flex flex-col items-center gap-2">
                    <div
                      className="w-6 rounded-full bg-gradient-to-t from-blue-600 to-emerald-400 shadow-[0_0_18px_rgba(59,130,246,0.35)]"
                      style={{ height }}
                      title={formatMoney(b.value)}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      {b.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#0a0a1a]/80 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">
                <Truck size={14} className="text-purple-400" /> Order Mix
              </div>
              <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                Status
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="flex items-center justify-center">
                <div className="relative w-44 h-44">
                  <div
                    className="w-full h-full rounded-full border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.25)]"
                    style={{ background: statusPie }}
                  />
                  <div className="absolute inset-6 rounded-full bg-[#0a0a1a] border border-white/10 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                        Orders
                      </p>
                      <p className="text-2xl font-black text-white">
                        {statusBreakdown.total}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {statusBreakdown.byStatus.map((row) => {
                  const percent = Math.round((row.count / statusBreakdown.total) * 100);
                  return (
                    <div key={row.status} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: statusColors[row.status as OrderStatus] }}
                        />
                        <span className="text-white/60">{row.status}</span>
                      </div>
                      <span className="text-white/40">{percent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
