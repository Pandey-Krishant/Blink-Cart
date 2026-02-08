import { auth } from '@/auth'
import AdminDashboard from '@/components/AdminDashboard'
import DeliveryBoy from '@/components/DeliveryBoy'
import Editrolemobile from '@/components/Editrolemobile'
import Nav from '@/components/Nav'
import UserDashboard from '@/components/UserDashboard'
import Welcome from '@/components/Welcome'
import connectDB from '@/lib/db'
import User from '@/modals/user.model'
import { redirect } from 'next/navigation'
import React from 'react'

async function page({ searchParams }: { searchParams?: { q?: string } }) {
  await connectDB()
  const session = await auth()
  
  // 1. .lean() use karne se Mongoose plain object return karega
  // 2. .exec() lagana achhi practice hai
  const userDoc = await User.findById(session?.user?.id).lean().exec();

  if (!userDoc) {
    redirect('/login')
  }

  // Next.js ke liye _id ko string mein convert karna padta hai 
  // kyunki ObjectId ek complex object hai
  const user = {
    ...userDoc,
    _id: userDoc._id.toString(),
  };

  const incomplete = !user.mobile || !user.role || (!user.mobile && user.role == "user")
  
  if (incomplete) {
    return <Editrolemobile /> 
  }

  const q = searchParams?.q ?? ""

  return (
    <>
      <Nav user={user } /> 
      {user.role=="user"?(<UserDashboard search={q} />):user.role=="admin"?(<AdminDashboard/>):<DeliveryBoy/>}
    </>
  )
}
export default page
