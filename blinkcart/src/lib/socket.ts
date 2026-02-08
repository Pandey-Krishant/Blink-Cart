import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

const resolveSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_SERVER) {
    return process.env.NEXT_PUBLIC_SOCKET_SERVER
  }
  if (typeof window !== "undefined") {
    // Prefer same-origin (useful when sockets are proxied through the app host).
    // Fall back to :4000 for typical local dev if same-origin isn't appropriate.
    try {
      const origin = window.location.origin;
      return origin;
    } catch {
      return `${window.location.protocol}//${window.location.hostname}:4000`;
    }
  }
  return "";
}

export const getSocket = () => {
  if (!socket) {
    const socketUrl = resolveSocketUrl()
    if (!socketUrl) {
      console.warn("[client-socket] socket server URL is missing")
    }
    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    })
    socket.on("connect", () => {
      // console.log("[client-socket] connected", socket?.id)
    })
    socket.on("connect_error", (err) => {
      console.error("[client-socket] connect_error", err)
    })
    socket.on("disconnect", (reason) => {
      // console.log("[client-socket] disconnected", reason)
    })
  }
  return socket
}

