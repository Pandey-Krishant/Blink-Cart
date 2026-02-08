"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const deliveryIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const destinationIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 16, { animate: true, duration: 0.8 });
  }, [center, map]);
  return null;
}

type Point = { lat: number; lng: number };
type DeliveryPoint = { lat: number; lng: number; accuracy?: number };

export default function TrackMap({
  destination,
  delivery,
  route,
}: {
  destination: Point;
  delivery?: DeliveryPoint | Point | null;
  route?: Array<[number, number]> | null;
}) {
  const center = useMemo<[number, number]>(() => {
    if (delivery) return [delivery.lat, delivery.lng];
    return [destination.lat, destination.lng];
  }, [delivery, destination.lat, destination.lng]);

  return (
    <>
      <MapContainer {...({ center, zoom: 14, className: "h-full w-full rounded-3xl" } as any)}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Recenter center={center} />
        <Marker {...({ position: [destination.lat, destination.lng], icon: destinationIcon } as any)} />
        {delivery && (
          <>
            <Marker {...({ position: [delivery.lat, delivery.lng], icon: deliveryIcon } as any)} />
            {/* show accuracy circle when available */}
            {(delivery as any)?.accuracy ? (
              <Circle {...({ center: [delivery.lat, delivery.lng], radius: (delivery as any).accuracy, pathOptions: { color: "#3b82f6", opacity: 0.15 } } as any)} />
            ) : null}
          </>
        )}
        {route && route.length > 1 ? (
          <>
            <Polyline
              positions={route}
              pathOptions={{ color: "#3b82f6", weight: 10, opacity: 0.2 }}
            />
            <Polyline
              positions={route}
              pathOptions={{ color: "#ef4444", weight: 4, opacity: 0.95, className: "tracking-route" }}
            />
          </>
        ) : delivery ? (
          <>
            <Polyline
              positions={[
                [delivery.lat, delivery.lng],
                [destination.lat, destination.lng],
              ]}
              pathOptions={{ color: "#3b82f6", weight: 10, opacity: 0.2 }}
            />
            <Polyline
              positions={[
                [delivery.lat, delivery.lng],
                [destination.lat, destination.lng],
              ]}
              pathOptions={{ color: "#ef4444", weight: 4, opacity: 0.95, dashArray: "6 10", className: "tracking-route" }}
            />
          </>
        ) : null}
      </MapContainer>
      <style jsx global>{`
        .tracking-route {
          stroke-dasharray: 8 14;
          animation: dash-move 1.2s linear infinite;
        }
        @keyframes dash-move {
          to {
            stroke-dashoffset: -22;
          }
        }
      `}</style>
    </>
  );
}
