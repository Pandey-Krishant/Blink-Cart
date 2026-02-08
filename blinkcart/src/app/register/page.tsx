"use client"

import Registerform from "@/components/Registerform"
import Welcome from "@/components/Welcome"
import { useState } from "react"

function Register() {
  const[step,Setstep]=useState(1)
  return (
    <div>
      {step==1?<Welcome nextstep={Setstep}/>:<Registerform previousstep={Setstep}/>}
    </div>
  )
}

export default Register
