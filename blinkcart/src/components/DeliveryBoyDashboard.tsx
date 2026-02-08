"use client";

import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, PackageCheck, History, ChevronDown, 
  MapPin, Clock, XCircle, CheckCircle2, ShoppingBag, Navigation 
} from 'lucide-react';
import BackgroundIcons from './Backgroundicons';
import { getSocket } from '@/lib/socket';
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import ChatRoom from "./ChatRoom";
import { useRouter } from "next/navigation";

const TrackMap = dynamic(() => import("./TrackMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-white/5 animate-pulse" />,
});

type Point = { lat: number; lng: number };

function toNumber(value: any) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function getDistanceKm(a?: Point | null, b?: Point | null) {
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

export default function DeliveryBoyDashboard() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [mapOpenFor, setMapOpenFor] = useState<any | null>(null);
  const [livePos, setLivePos] = useState<Point | null>(null);
  const [routePoints, setRoutePoints] = useState<Array<[number, number]> | null>(null);
  const [geoDestination, setGeoDestination] = useState<Point | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const userId = useSelector((state: RootState) => state.user.userData?._id);
  const router = useRouter();

  const fetchAssignments = useCallback(async () => {
    try {
      const result = await axios.get("/api/delivery/get-assignments");
      const list = Array.isArray(result.data) ? result.data : result.data?.assignments || [];
      setAssignments(list);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    const socket = getSocket();
    const handleBroadcast = () => {
      fetchAssignments();
    };
    socket?.on("delivery-assignment-broadcasted", handleBroadcast);
    return () => {
      socket?.off("delivery-assignment-broadcasted", handleBroadcast);
    };
  }, [fetchAssignments]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported in this browser");
      return;
    }
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      console.warn("Geolocation requires HTTPS (or localhost). Skipping location updates.");
      return;
    }
    const socket = getSocket();
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
          return;
        }
        setLivePos({ lat, lng });
        if (userId) {
          socket?.emit("update-location", { userId, latitude: lat, longitude: lng });
        }
      },
      (err) => {
        const code = (err as any)?.code;
        const message = (err as any)?.message || "Unknown geolocation error";
        console.warn("Geo error:", { code, message });
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    const fetchRoute = async () => {
      const destination = mapOpenFor?.destination || geoDestination;
      if (!destination || !livePos) {
        setRoutePoints(null);
        return;
      }
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${livePos.lng},${livePos.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
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
  }, [mapOpenFor, livePos, geoDestination]);

  useEffect(() => {
    let cancelled = false;
    const fetchGeo = async () => {
      if (mapOpenFor?.destination) {
        setGeoDestination(null);
        return;
      }
      const addr = mapOpenFor?.item?.order?.address;
      const query = [addr?.fullAddress, addr?.city, addr?.pincode].filter(Boolean).join(", ");
      if (!query) return;
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const data = await res.json();
        const first = Array.isArray(data) ? data[0] : null;
        const lat = Number(first?.lat);
        const lng = Number(first?.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        if (!cancelled) setGeoDestination({ lat, lng });
      } catch {
        if (!cancelled) setGeoDestination(null);
      }
    };
    fetchGeo();
    return () => {
      cancelled = true;
    };
  }, [mapOpenFor]);

  useEffect(() => {
    setOtpSent(false);
    setOtpInput("");
    setOtpError(null);
    setOtpSuccess(null);
  }, [mapOpenFor?._id, mapOpenFor?.item?.order?._id]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAccept = async (id: string) => {
    const assignmentId = String(id || "");
    if (!assignmentId) {
      alert("Assignment id missing");
      return;
    }
    setAcceptingId(assignmentId);
    try {
      await axios.get(`/api/delivery/assignment/${assignmentId}/accept-assignment`);
      await fetchAssignments();
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Accept failed";
      console.error("Accept Error:", message);
      alert(message);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const assignmentId = String(id || "");
    if (!assignmentId) {
      alert("Assignment id missing");
      return;
    }
    try {
      await axios.get(`/api/delivery/assignment/${assignmentId}/reject-assignment`);
      setAssignments((prev) =>
        Array.isArray(prev) ? prev.filter((a) => String(a?._id) !== assignmentId) : prev
      );
      if (expandedId === assignmentId) setExpandedId(null);
      if (mapOpenFor?._id === assignmentId) setMapOpenFor(null);
      await fetchAssignments();
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message || (error as any)?.message || "Reject failed";
      console.error("Reject Error:", message);
      alert(message);
    }
  };

  const requestOtp = async (orderId: string) => {
    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);
    try {
      await axios.post("/api/delivery/delivery-otp/request", { orderId });
      setOtpSent(true);
      setOtpSuccess("OTP sent to customer email");
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "OTP request failed";
      setOtpError(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async (orderId: string) => {
    const code = otpInput.trim();
    if (!code) return;
    setOtpVerifyLoading(true);
    setOtpError(null);
    setOtpSuccess(null);
    try {
      await axios.post("/api/delivery/delivery-otp/verify", {
        orderId,
        otp: code,
      });
      setOtpSuccess("Order marked as delivered");
      setOtpSent(false);
      setOtpInput("");
      await fetchAssignments();
      router.push("/delivery/delivered");
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "OTP verification failed";
      setOtpError(message);
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-10 font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full" />
      <BackgroundIcons/>
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Dispatch Center
            </h1>
            <p className="text-white/40 text-xs mt-2 tracking-widest uppercase flex items-center justify-center md:justify-start gap-2">
              <Radio size={14} className="text-red-500 animate-pulse" /> Live Assignment Stream
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
             <p className="text-[10px] text-white/40 uppercase tracking-tighter">Queue Size</p>
             <p className="text-xl font-bold text-blue-400">{assignments.length} Orders</p>
          </div>
        </header>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
               <div className="text-center py-20 opacity-30 animate-pulse">Scanning database...</div>
            ) : assignments.length > 0 ? (
              assignments.map((item) => {
                const orderData = item.order;
                
                // ðŸ”¥ SYNCED ID: Using order._id instead of assignment._id
                const originalOrderId = orderData?._id?.toString() || "N/A";
                const displayId = originalOrderId.slice(-6).toUpperCase();
                
                const totalAmount = orderData?.totalAmount || 0;
                const deliveryFee = orderData?.deliveryFee || 0;
                const itemsCount = orderData?.items?.length || 0;

                const rawAddress = orderData?.address;
                const displayAddress = typeof rawAddress === 'object' && rawAddress !== null
                  ? `${rawAddress.fullAddress || ''}, ${rawAddress.city || ''}, ${rawAddress.pincode || ''}`
                  : rawAddress || "Address not provided";
                
                const isAssigned = item.status === "assigned";
                const isBroadcasted = item.status === "broadcasted";
                const destination: Point | null = (() => {
                  const lat = toNumber(orderData?.address?.latitude);
                  const lng = toNumber(orderData?.address?.longitude);
                  if (lat === null || lng === null) return null;
                  return { lat, lng };
                })();
                const distanceKm = getDistanceKm(livePos, destination);

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.03] border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md hover:border-white/20 transition-all"
                  >
                    <div onClick={() => toggleExpand(item._id)} className="p-6 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-5">
                        <div className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl border border-white/5">
                          <PackageCheck className="text-purple-400" size={28} />
                        </div>
                        <div>
                          {/* ðŸ”¥ DIsplaying synced short ID */}
                          <h3 className="font-bold text-xl tracking-tight">Order #{displayId}</h3>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-emerald-400 text-sm font-bold">₹{totalAmount}</span>
                             <span className="text-white/20">|</span>
                             <span className="text-amber-400 text-xs font-bold">Fee Ã¢â€šÂ¹{deliveryFee}</span>
                             <span className="text-white/20">|</span>
                             <p className="text-white/40 text-xs flex items-center gap-1">
                               <Clock size={12} /> {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.status === 'broadcasted' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          {item.status}
                        </div>
                        <motion.div animate={{ rotate: expandedId === item._id ? 180 : 0 }}>
                          <ChevronDown className="text-white/20" />
                        </motion.div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedId === item._id && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="border-t border-white/5 bg-white/[0.01]">
                          <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                <p className="text-purple-400 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                                  <MapPin size={12} /> Delivery Destination
                                </p>
                                <p className="text-sm text-white/70 leading-relaxed pl-5 border-l border-white/10">
                                  {displayAddress}
                                </p>
                              </div>
                              <div className="space-y-4">
                                <p className="text-blue-400 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                                  <ShoppingBag size={12} /> Order Summary
                                </p>
                                <div className="pl-5 border-l border-white/10">
                                  <p className="text-sm text-white/70">{itemsCount} Items in bag</p>
                                  <p className="text-[10px] text-amber-400 mt-1 uppercase">Delivery Fee: Ã¢â€šÂ¹{deliveryFee}</p>
                                  {/* ðŸ”¥ Showing full Original Order ID for verification */}
                                  <p className="text-[10px] text-white/30 mt-1 uppercase">Order Ref: {originalOrderId}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                              <button
                                onClick={() => handleReject(item._id)}
                                disabled={!(isAssigned || isBroadcasted)}
                                className="flex-1 py-4 rounded-2xl bg-red-500/10 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                <XCircle size={16} /> Reject Assignment
                              </button>
                              <button
                              onClick={()=>handleAccept(item._id)}
                              disabled={acceptingId === item._id || isAssigned}
                              className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-purple-500/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                                <CheckCircle2 size={16} /> {isAssigned ? "Accepted" : (acceptingId === item._id ? "Accepting..." : "Accept & Start Delivery")}
                              </button>
                            </div>
                            {isAssigned && (
                              <div className="pt-2">
                                <button
                                  onClick={() => setMapOpenFor({ item, destination })}
                                  className="w-full py-3 rounded-2xl bg-blue-500/10 text-blue-300 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-blue-500/30 hover:bg-blue-500/20 transition-all"
                                >
                                  <Navigation size={14} /> Order Kahan Dena
                                </button>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-2 text-center">
                                  {distanceKm === null ? "Calculating distance..." : `${distanceKm.toFixed(2)} km away`}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] py-24 text-center">
                <History size={48} className="mx-auto mb-4 text-white/10" />
                <h3 className="text-white/40 font-bold uppercase tracking-widest text-sm">No Active Broadcasts</h3>
                <p className="text-white/20 text-xs mt-1">Waiting for new orders from the server...</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {mapOpenFor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMapOpenFor(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            >
              <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0b0b1a] border border-white/10 rounded-[28px] p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Delivery Map</p>
                    <p className="text-white font-black text-lg">Order Destination</p>
                  </div>
                  <button
                    onClick={() => setMapOpenFor(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all"
                  >
                    Close
                  </button>
                </div>
                <div className="h-[420px] md:h-[520px] rounded-3xl overflow-hidden">
                  {mapOpenFor.destination || geoDestination ? (
                    <TrackMap destination={mapOpenFor.destination || geoDestination} delivery={livePos} route={routePoints} />
                  ) : (
                    <div className="h-full w-full bg-white/5 animate-pulse" />
                  )}
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-3 text-center">
                  {getDistanceKm(livePos, mapOpenFor.destination || geoDestination)?.toFixed(2) ?? "Calculating"} km away
                </p>
                {mapOpenFor?.item?.order?._id && (
                  <div className="mt-4">
                    <ChatRoom
                      orderId={String(mapOpenFor.item.order._id)}
                      showSuggestions
                      className="bg-white/[0.02]"
                    />
                  </div>
                )}
                {mapOpenFor?.item?.order?._id && mapOpenFor?.item?.order?.status !== "delivered" && (
                  <div className="mt-4 bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">
                      Delivery Confirmation
                    </p>
                    <div className="mt-3 flex flex-col md:flex-row gap-3">
                      <button
                        onClick={() => requestOtp(String(mapOpenFor.item.order._id))}
                        disabled={otpLoading}
                        className="px-4 py-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-widest hover:bg-emerald-500/30 disabled:opacity-60"
                      >
                        {otpLoading ? "Sending OTP..." : "Mark as Delivered"}
                      </button>
                      {otpSent && (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            placeholder="Enter OTP"
                            className="flex-1 bg-black/30 border border-white/10 rounded-2xl px-4 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
                          />
                          <button
                            onClick={() => verifyOtp(String(mapOpenFor.item.order._id))}
                            disabled={otpVerifyLoading || !otpInput.trim()}
                            className="px-4 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-60"
                          >
                            {otpVerifyLoading ? "Verifying..." : "Confirm"}
                          </button>
                        </div>
                      )}
                    </div>
                    {otpError && (
                      <p className="text-red-300 text-xs mt-2">{otpError}</p>
                    )}
                    {otpSuccess && (
                      <p className="text-emerald-300 text-xs mt-2">{otpSuccess}</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
