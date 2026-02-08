"use client"
import { getSocket } from '@/lib/socket'
import { useEffect } from 'react'

function Geoupdater({ userId }: { userId: string }) {
    useEffect(() => {
        if (!userId || typeof window === "undefined") return;
        if (!navigator.geolocation) {
            console.warn("Geolocation not supported in this browser");
            return;
        }
        if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
            console.warn("Geolocation requires HTTPS (or localhost). Skipping location updates.");
            return;
        }

        const socket = getSocket();
        socket.emit("identity", userId);

        let active = true;

        // Buffer a few samples and send averaged location to reduce jitter.
        const samples: Array<{ lat: number; lon: number; acc: number }> = [];
        const sendAveraged = (arr: typeof samples) => {
            if (arr.length === 0) return;
            let sumLat = 0, sumLon = 0, sumW = 0, sumAcc = 0;
            arr.forEach((s) => {
                const w = 1 / (s.acc + 1);
                sumLat += s.lat * w;
                sumLon += s.lon * w;
                sumW += w;
                sumAcc += s.acc;
            });
            const avgLat = sumLat / sumW;
            const avgLon = sumLon / sumW;
            const avgAcc = sumAcc / arr.length;

            // console.log("ðŸ“ Sending Averaged Coords:", { latitude: avgLat, longitude: avgLon, accuracy: avgAcc });

            socket.emit("update-location", {
                userId,
                latitude: avgLat,
                longitude: avgLon,
                accuracy: Math.round(avgAcc)
            });
        };

        const watcher = navigator.geolocation.watchPosition(
            (pos) => {
                const latitude = pos.coords.latitude;
                const longitude = pos.coords.longitude;
                const acc = pos.coords.accuracy ?? 1000;
                if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (latitude === 0 && longitude === 0)) {
                    return;
                }
                samples.push({ lat: latitude, lon: longitude, acc });
                if (samples.length >= 3) {
                    // send averaged and clear buffer
                    sendAveraged(samples.slice());
                    samples.length = 0;
                }
            },
            (err) => {
                const code = (err as any)?.code;
                const message = (err as any)?.message || "Unknown geolocation error";
                console.warn("Geolocation Error:", { code, message });
            },
            {
                enableHighAccuracy: true,
                maximumAge: 1000,
                timeout: 20000,
            }
        );

        return () => {
            active = false;
            navigator.geolocation.clearWatch(watcher);
        };
    }, [userId]);

    return null;
}

export default Geoupdater;
