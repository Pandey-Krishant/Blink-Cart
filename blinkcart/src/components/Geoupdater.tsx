"use client"
import { getSocket } from '@/lib/socket'
import React, { useEffect } from 'react'

function Geoupdater({ userId }: { userId: string }) {
    useEffect(() => {
        if (!userId || !navigator.geolocation) return;

        const socket = getSocket();
        socket.emit("identity",userId)

        const watcher = navigator.geolocation.watchPosition((pos) => {
            const { latitude, longitude } = pos.coords;

            // Debugging ke liye console check karna bro
            console.log("📍 Sending Coords:", longitude, latitude);

            // Seedha wahi format bhejo jo Schema ko chahiye
            socket.emit("update-location", {
                userId,
                latitude, // Server ko ye chahiye destructuring ke liye
                longitude // Server ko ye chahiye destructuring ke liye
            });
        }, (err) => {
            console.error("❌ Geolocation Error:", err);
        }, { 
            enableHighAccuracy: true,
            maximumAge: 0, 
            timeout: 5000 
        });

        return () => {
            navigator.geolocation.clearWatch(watcher);
        };
    }, [userId]);

    return null;
}

export default Geoupdater;