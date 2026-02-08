"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, PhoneCall, User, MapPin, Loader2 } from "lucide-react";
import Backgroundicons from "@/components/Backgroundicons";
import dynamic from "next/dynamic";
import { getSocket } from "@/lib/socket";
import ChatRoom from "@/components/ChatRoom";

const TrackMap = dynamic(() => import("@/components/TrackMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-white/5 animate-pulse" />,
});

type AssignedUser = {
  _id?: string;
  name?: string;
  mobile?: string;
  location?: {
    type?: string;
    coordinates?: number[];
  };
};

type Assignment = {
  _id?: string;
  status?: string;
  assignedTo?: AssignedUser | null;
};

type Order = {
  _id: string;
  status?: string;
  address?: {
    fullname?: string;
    fullAddress?: string;
    city?: string;
    pincode?: string;
    latitude?: string;
    longitude?: string;
  };
  assignment?: Assignment | null;
};

function toNumber(value: any) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function isValidObjectId(value: string) {
  return /^[a-fA-F0-9]{24}$/.test(value);
}

function getDistanceKm(a?: { lat: number; lng: number } | null, b?: { lat: number; lng: number } | null) {
  if (!a || !b) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

export default function TrackOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = useMemo(() => {
    const raw = (params as any)?.orderid;
    if (Array.isArray(raw)) return raw[0] || "";
    if (typeof raw === "string") return raw;
    return "";
  }, [params]);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routePoints, setRoutePoints] = useState<Array<[number, number]> | null>(null);
  const [liveDelivery, setLiveDelivery] = useState<{ lat: number; lng: number } | null>(null);
  const [geoDestination, setGeoDestination] = useState<{ lat: number; lng: number } | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId || orderId === "undefined") return;
    if (!isValidObjectId(orderId)) {
      setError(`Invalid order id: ${orderId}`);
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get(`/api/user/track-order/${orderId}`);
      setOrder(data?.order ?? null);
      setError(null);
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Unable to fetch tracking data";
      console.error("Track order fetch error:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    const timer = setInterval(fetchOrder, 5000);
    return () => clearInterval(timer);
  }, [fetchOrder]);

  const destination = useMemo(() => {
    const lat = toNumber(order?.address?.latitude);
    const lng = toNumber(order?.address?.longitude);
    if (lat === null || lng === null) return null;
    if (lat === 0 && lng === 0) return null;
    return { lat, lng };
  }, [order?.address?.latitude, order?.address?.longitude]);

  const delivery = useMemo(() => {
    if (liveDelivery) return liveDelivery;
    const coords = order?.assignment?.assignedTo?.location?.coordinates;
    const lng = toNumber(coords?.[0]);
    const lat = toNumber(coords?.[1]);
    if (lat === null || lng === null) return null;
    if (lat === 0 && lng === 0) return null;
    return { lat, lng };
  }, [order?.assignment?.assignedTo?.location?.coordinates, liveDelivery]);

  const effectiveDestination = destination ?? geoDestination;
  const distanceKm = useMemo(() => getDistanceKm(delivery, effectiveDestination), [delivery, effectiveDestination]);

  useEffect(() => {
    let cancelled = false;
    const fetchGeo = async () => {
      if (destination) return;
      const full = order?.address?.fullAddress;
      const city = order?.address?.city;
      const pin = order?.address?.pincode;
      const query = [full, city, pin].filter(Boolean).join(", ");
      if (!query) return;
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const data = await res.json();
        const first = Array.isArray(data) ? data[0] : null;
        const lat = toNumber(first?.lat);
        const lng = toNumber(first?.lon);
        if (lat !== null && lng !== null && !cancelled) {
          setGeoDestination({ lat, lng });
        }
      } catch {
        if (!cancelled) setGeoDestination(null);
      }
    };
    fetchGeo();
    return () => {
      cancelled = true;
    };
  }, [order?.address?.fullAddress, order?.address?.city, order?.address?.pincode, destination]);

  useEffect(() => {
    const socket = getSocket();
    const deliveryId = order?.assignment?.assignedTo?._id;
    if (!deliveryId) return;
    const handler = (payload: { userId?: string; latitude?: number; longitude?: number }) => {
      if (!payload?.userId || payload.userId !== deliveryId) return;
      if (typeof payload.latitude !== "number" || typeof payload.longitude !== "number") return;
      setLiveDelivery({ lat: payload.latitude, lng: payload.longitude });
    };
    socket?.on("location-updated", handler);
    return () => {
      socket?.off("location-updated", handler);
    };
  }, [order?.assignment?.assignedTo?._id]);

  useEffect(() => {
    let cancelled = false;
    const fetchRoute = async () => {
      if (!delivery || !effectiveDestination) {
        setRoutePoints(null);
        return;
      }
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${delivery.lng},${delivery.lat};${effectiveDestination.lng},${effectiveDestination.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        const coords = data?.routes?.[0]?.geometry?.coordinates;
        if (!Array.isArray(coords)) {
          setRoutePoints(null);
          return;
        }
        const latlngs = coords.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
        if (!cancelled) setRoutePoints(latlngs);
      } catch {
        if (!cancelled) setRoutePoints(null);
      }
    };
    const t = setTimeout(fetchRoute, 800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [delivery, effectiveDestination]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b1a] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px]">Loading live tracking...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b1a] text-white p-4 md:p-12 relative overflow-hidden">
      <Backgroundicons />

      <div className="relative z-10 max-w-5xl mx-auto">
        <header className="mb-10 relative flex items-center justify-center">
          <button
            onClick={() => router.back()}
            className="absolute left-0 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all group active:scale-90"
          >
            <ArrowLeft size={20} className="text-white/60 group-hover:text-blue-400" />
          </button>

          <div className="flex flex-col items-center">
            <h1 className="text-3xl md:text-5xl font-black tracking-[0.2em] uppercase italic text-center">
              Track <span className="text-blue-500 text-glow">Order</span>
            </h1>
            <div className="h-1.5 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mt-4"></div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/[0.03] border border-white/5 rounded-[28px] p-6">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Order</p>
              <p className="text-sm font-bold tracking-widest mt-1">#{order?._id?.slice(-6).toUpperCase()}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-3">{order?.status || "pending"}</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-[28px] p-5 text-red-300 text-xs font-bold uppercase tracking-widest">
                {error}
              </div>
            )}

            <div className="bg-white/[0.03] border border-white/5 rounded-[28px] p-6 space-y-3">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Delivery Partner</p>
              <div className="flex items-center gap-2 text-[11px] font-black text-white/80 uppercase tracking-widest">
                <User size={12} className="text-blue-400" />
                <span>{order?.assignment?.assignedTo?.name || "Not assigned"}</span>
              </div>
              {order?.assignment?.assignedTo?.mobile && (
                <a
                  href={`tel:${order.assignment.assignedTo.mobile}`}
                  className="flex items-center gap-2 text-[11px] font-black text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <PhoneCall size={12} />
                  <span>{order.assignment.assignedTo.mobile}</span>
                </a>
              )}
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-[28px] p-6 space-y-2">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Destination</p>
              <div className="flex items-start gap-2 text-[11px] font-bold text-white/60">
                <MapPin size={14} className="text-blue-400 mt-0.5" />
                <span>
                  {order?.address?.fullAddress || "Address not available"}
                  {order?.address?.city ? `, ${order.address.city}` : ""}
                  {order?.address?.pincode ? ` - ${order.address.pincode}` : ""}
                </span>
              </div>
            </div>

            <div className="bg-blue-600/20 border border-blue-500/20 rounded-[28px] p-6">
              <p className="text-[10px] font-black uppercase tracking-widest">Distance</p>
              <p className="text-2xl font-black text-blue-400 mt-2">
                {distanceKm === null ? "Calculating..." : `${distanceKm.toFixed(2)} km away`}
              </p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">
                Live update every 5 seconds
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-3 md:p-4">
              <div className="h-[420px] md:h-[520px] rounded-3xl overflow-hidden">
                {effectiveDestination ? (
                  <TrackMap destination={effectiveDestination} delivery={delivery} route={routePoints} />
                ) : (
                  <div className="h-full w-full bg-white/5 animate-pulse" />
                )}
              </div>
            </div>
            {orderId && (
              <ChatRoom orderId={orderId} className="bg-white/[0.02]" />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .text-glow {
          text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}
