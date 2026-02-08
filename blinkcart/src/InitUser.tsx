import React from 'react'
import { useSelector } from 'react-redux'
import useGetMe from './hooks/useGetMe'
import type { RootState } from './redux/store'
import Geoupdater from './components/Geoupdater'

function InitUser() {
    useGetMe()
    const userId = useSelector((state: RootState) => state.user.userData?._id)
    return userId ? <Geoupdater userId={String(userId)} /> : null
  
}

export default InitUser
