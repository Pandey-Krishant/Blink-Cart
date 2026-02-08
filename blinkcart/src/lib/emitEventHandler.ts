import axios from 'axios'


async function emitEventHandler(event:string,data:any,socketId?:string) {
try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SOCKET_SERVER || process.env.SOCKET_SERVER_INTERNAL_URL
    if (!baseUrl) {
      console.warn("[emitEventHandler] socket server URL is missing")
      return
    }
    await axios.post(`${baseUrl}/notify`, { socketId, event, data })
    // console.log("[emitEventHandler] emitted", { event, socketId })
} catch (error) {
    console.error("[emitEventHandler] error", error)
}
  
}

export default emitEventHandler
