"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet icons
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Helper component to center map on load
function SetViewOnClick({ animateRef }: any) {
  const map = useMap();
  useEffect(() => {
    if (animateRef) map.setView(animateRef, 15);
  }, [animateRef, map]);
  return null;
}

export default function Map({ onLocationChange }: any) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  const handleDragEnd = (e: any) => {
    const { lat, lng } = e.target.getLatLng();
    onLocationChange(lat, lng);
  };

  if (!position) return <div className="h-full w-full bg-white/5 animate-pulse" />;

  return (
    <MapContainer center={position} zoom={15} className="h-full w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <SetViewOnClick animateRef={position} />
      <Marker 
        position={position} 
        icon={icon} 
        draggable={true} 
        eventHandlers={{ dragend: handleDragEnd }}
      />
    </MapContainer>
  );
}