import mongoose from "mongoose";
interface IUser extends mongoose.Document{
    _id:mongoose.Types.ObjectId
    name:string,
    email:string
    password?:string
    mobile?:string
    role:"user"|"deliveryBoy"|"admin",
    image?:string
    socketId?:string
    isOnline?:boolean
    location?:{
        type: string,
        coordinates: number[]
    }
    

}

const userSchema= new mongoose.Schema<IUser>({
name:{
    type:String,
    required:true
},
email:{
    type:String,
    required:true,
    unique:true
},
password:{
    type:String,
    required:false
},
mobile:{
    type:String,
    required:false
},
role:{
    type:String,
    enum:["user","deliveryBoy","admin"],
    default:"user"
},
image:{
    type:String
}
,
socketId: {
    type: String,
    required: false,
},
isOnline: {
    type: Boolean,
    default: false,
},
location: {
    type: {
        type: String,
        enum: ["Point"],
        default: "Point",
    },
    coordinates: {
        type: [Number],
        default: [0, 0]
    }
}

},{timestamps:true})

userSchema.index({ location: '2dsphere' })

const User=mongoose.models.User || mongoose.model<IUser>("User",userSchema)
export default User
