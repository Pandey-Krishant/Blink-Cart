"use client";
import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Ensure Leaflet default icons load from CDN (fixes missing marker images)
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Local custom icon (used for draggable marker)
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Normalize different coordinate shapes and guard against swapped lat/lng
function normalizeCoords(input: any): [number, number] | null {
  if (!input) return null;
  let lat: number = NaN;
  let lng: number = NaN;
  if (Array.isArray(input) && input.length >= 2) {
    lat = Number(input[0]);
    lng = Number(input[1]);
  } else if (typeof input === "object") {
    lat = Number(input.lat ?? input.latitude ?? input[0]);
    lng = Number(input.lng ?? input.lon ?? input.longitude ?? input[1]);
  } else if (typeof input === "string") {
    const parts = input.split(",").map((s) => s.trim());
    if (parts.length >= 2) {
      lat = Number(parts[0]);
      lng = Number(parts[1]);
    }
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  // If lat looks like a longitude (> 90 or < -90) and lng looks like a latitude, swap them
  if ((lat > 90 || lat < -90) && (lng <= 90 && lng >= -90)) {
    const tmp = lat;
    lat = lng;
    lng = tmp;
  }
  return [lat, lng];
}

// Helper component to center map on load
function SetViewOnClick({ animateRef }: any) {
  const map = useMap();
  useEffect(() => {
    const target = normalizeCoords(animateRef);
    if (target) {
      // ensure map has correct size (in case container was hidden/resized)
      setTimeout(() => map.invalidateSize(), 50);
      map.flyTo(target, 15);
    }
  }, [animateRef, map]);
  return null;
}

export default function Map({ onLocationChange, forcedPosition, enableWatch = true }: any) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [firstFix, setFirstFix] = useState(false);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [manualOverride, setManualOverride] = useState(false);
  const samplesRef = useRef<Array<{ lat: number; lon: number; acc: number }>>([]);
  const hasInitialFixRef = useRef(false);
  useEffect(() => {
    if (!enableWatch) return;
    if (!navigator.geolocation) return;

    // Start a high-accuracy watch to collect samples. We'll use an initial
    // sample buffer to compute a better averaged location, then continue
    // to update live position normally.
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        if (manualOverride) return;
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const acc = pos.coords.accuracy ?? 1000;
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

        // Log each sample for debugging (can be noisy)
        console.debug("Map sample:", { lat, lon, acc });

        // If we don't yet have any fix, accept the first valid sample immediately
        if (!hasInitialFixRef.current) {
          setPosition([lat, lon]);
          setAccuracyMeters(Math.round(acc));
          onLocationChange?.(lat, lon);
          hasInitialFixRef.current = true;
          setFirstFix(true);
        }

        // Push into sample buffer for refined averaging
        const buf = samplesRef.current;
        buf.push({ lat, lon, acc });
        // keep only recent 8 samples
        if (buf.length > 8) buf.shift();

        // If we have at least 3 samples, compute weighted average for improved accuracy
        if (buf.length >= 3) {
          let sumLat = 0,
            sumLon = 0,
            sumW = 0,
            sumAcc = 0;
          buf.forEach((s) => {
            const w = 1 / (s.acc + 1);
            sumLat += s.lat * w;
            sumLon += s.lon * w;
            sumW += w;
            sumAcc += s.acc;
          });
          const avgLat = sumLat / sumW;
          const avgLon = sumLon / sumW;
          const avgAcc = sumAcc / buf.length;
          setPosition([avgLat, avgLon]);
          setAccuracyMeters(Math.round(avgAcc));
          onLocationChange?.(avgLat, avgLon);
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [onLocationChange, manualOverride, enableWatch]);

  // One-time quick position attempt so the map shows current location immediately
  useEffect(() => {
    if (!enableWatch) return;
    if (!navigator.geolocation) return;
    if (position) return; // already have a position
    try {
      // Fast initial attempt: allow cached result and short timeout so map shows quick
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (manualOverride) return;
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const acc = pos.coords.accuracy ?? 1000;
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
          setPosition([lat, lon]);
          setAccuracyMeters(Math.round(acc));
          onLocationChange?.(lat, lon);
          hasInitialFixRef.current = true;
          setFirstFix(true);
        },
        (err) => {
          console.debug("Map: quick getCurrentPosition failed", err?.message || err);
          // no-op: watchPosition will continue collecting samples
        },
        { enableHighAccuracy: true, maximumAge: 60000, timeout: 5000 }
      );
    } catch (e) {
      console.debug("Map: getCurrentPosition threw", e);
    }
  }, [enableWatch, position, manualOverride, onLocationChange]);

  const handleQuickLocate = () => {
    if (!navigator.geolocation) return;
    // show locating overlay while attempting
    setFirstFix(false);
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (manualOverride) return;
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const acc = pos.coords.accuracy ?? 1000;
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
          setPosition([lat, lon]);
          setAccuracyMeters(Math.round(acc));
          onLocationChange?.(lat, lon);
          hasInitialFixRef.current = true;
          setFirstFix(true);
        },
        (err) => {
          console.debug("Map: quick locate failed", err?.message || err);
          setFirstFix(true);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 }
      );
    } catch (e) {
      console.debug("Map: quick locate threw", e);
      setFirstFix(true);
    }
  };

  

  useEffect(() => {
    const p = normalizeCoords(forcedPosition);
    if (p) {
      setPosition(p);
      hasInitialFixRef.current = true;
      setFirstFix(true);
    }
  }, [forcedPosition]);

  const handleDragEnd = (e: any) => {
    const { lat, lng } = e.target.getLatLng();
    setPosition([lat, lng]);
    setManualOverride(true);
    console.debug("Map: user dragged marker to", lat, lng);
    onLocationChange(lat, lng);
  };

  const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
  const normalizedForced = normalizeCoords(forcedPosition);
  const center = position ?? normalizedForced ?? DEFAULT_CENTER;

  const showMap = Boolean(firstFix || normalizedForced);

  // If we don't have a fix yet, don't render the map to avoid showing wrong default center
  if (!showMap && enableWatch) {
    return (
      <div className="relative h-full w-full">
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="flex flex-col items-center gap-3 text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white/30 border-t-white" />
            <div className="uppercase tracking-widest text-sm">Locatingâ€¦</div>
            <div className="mt-2">
              <button onClick={handleQuickLocate} className="px-4 py-2 bg-white/10 border border-white/20 rounded-2xl">Locate now</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer {...({ center, zoom: 15, className: "h-full w-full" } as any)}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <SetViewOnClick animateRef={position ?? normalizedForced} />
        {position && (
          <>
            <Marker {...({ position, icon, draggable: true, eventHandlers: { dragend: handleDragEnd } } as any)} />
            {accuracyMeters !== null && accuracyMeters > 0 && (
              <Circle {...({ center: position, radius: accuracyMeters, pathOptions: { color: "#3b82f6", opacity: 0.2 } } as any)} />
            )}
          </>
        )}
      </MapContainer>

      {/* Quick-locate button */}
      <div className="absolute right-4 bottom-4 z-30">
        <button
          type="button"
          onClick={handleQuickLocate}
          title="Center to current location"
          aria-label="Center to current location"
          className="p-3 rounded-2xl bg-white/10 border border-white/20 text-white/80 hover:text-blue-400 hover:border-blue-500/40 transition-all"
        >
          Locate
        </button>
      </div>
    </div>
  );
}
