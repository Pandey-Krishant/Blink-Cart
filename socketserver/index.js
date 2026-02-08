import express from "express";
import http from "http";
import dotenv from "dotenv";
import axios from "axios";
import { Server } from "socket.io";
dotenv.config();
const NEXT_BASE_URL = process.env.NEXT_BASE_URL || "http://localhost:3000";
const app = express();

app.use(express.json());
const server = http.createServer(app);
const port = process.env.PORT || 4000;

const allowedOrigins = []
if (NEXT_BASE_URL) {
  allowedOrigins.push(NEXT_BASE_URL)
}
if (process.env.SOCKET_CORS_ORIGIN) {
  allowedOrigins.push(
    ...process.env.SOCKET_CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
  )
}

const io = new Server(server, {
  cors: {
    origin:"*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("[socketserver] client connected", socket.id)

  socket.on("identity", async (userId) => {
    try{
      socket.data.userId = userId
      console.log("[socketserver] identity received:", { userId, socketId: socket.id })
      const resp = await axios.post(`${NEXT_BASE_URL}/api/socket/connect`, {
        userId,
        socketId: socket.id,
        isOnline: true
      });
      console.log("[socketserver] POST /api/socket/connect response:", resp.status)
    }catch(err){
      console.error('[socketserver] error posting connect:', err && err.toString())
    }
  });

  socket.on("update-location", async ({ userId, latitude, longitude }) => {
    try{
      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        (latitude === 0 && longitude === 0)
      ) {
        return;
      }
      const location={
          type:"Point",
          coordinates:[longitude,latitude]
      }
      console.log("[socketserver] update-location received:", { userId, location })
      const resp = await axios.post(`${NEXT_BASE_URL}/api/socket/updatelocation`, {
        userId,
        location
      });
      console.log("[socketserver] POST /api/socket/updatelocation response:", resp.status)
      // include accuracy if provided by client payload
      const accuracy = typeof latitude === 'object' && latitude?.accuracy ? latitude.accuracy : undefined;
      // If latitude/longitude were passed as numbers, attempt to read accuracy from original payload variable 'location' above
      const emitted = { userId, latitude, longitude };
      if (typeof accuracy === 'number') emitted.accuracy = accuracy;
      io.emit("location-updated", emitted);
    }catch(err){
      console.error('[socketserver] error posting updatelocation:', err && err.toString())
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    const userId = socket.data.userId
    if (!userId) return
    axios.post(`${NEXT_BASE_URL}/api/socket/connect`, {
      userId,
      socketId: null,
      isOnline: false
    }).catch((err) => {
      console.error('[socketserver] error posting disconnect:', err && err.toString())
    })
  });
});



app.post("/notify",(req,res)=>{
  const {event,data,socketId}=req.body
  console.log("[socketserver] notify received", { event, hasSocketId: Boolean(socketId) })
  if(socketId){
    io.to(socketId).emit(event,data)
  }else{
    io.emit(event,data)
  }
  console.log("[socketserver] notify emitted", { event, socketId: socketId ?? "broadcast" })
  return res.status(200).json({"success":true})
})



server.listen(port, () => {
  console.log("server started at", port);
});
