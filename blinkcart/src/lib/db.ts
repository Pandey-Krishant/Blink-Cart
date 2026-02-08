import mongoose from "mongoose";

const mongodbURL=process.env.MONGODB_URL


if(!mongodbURL){
    throw new Error("Database Error")
}

let cached= global.mongoose
if(!cached){
    cached = global.mongoose={conn:null,promise:null}
}

const connectDB= async ()=>{
    if(cached.conn){
        return  cached.conn
    }
    if (!cached.promise){
        cached.promise=mongoose.connect(mongodbURL).then((conn)=>conn.connection)
    }
    try {
        const conn=await cached.promise
        return conn
    } catch (error) {
        // console.log("error")
    }
}

export default connectDB
