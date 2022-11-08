import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Button } from '@material-ui/core'
import Auth from './auth'
import { useState, useEffect } from 'react';

export default function Home() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = window.localStorage.getItem("dailyUserToken")
    const user = token ? decodeToken(token) : null

    setUser(user)
  }, [])

  const handleLogin = (result) => {
    setLoading(true)
    const { user, token } = result

    setUser(user)
    window.localStorage.setItem("dailyUserToken", token)

    if (window.localStorage.getItem("dailyUserToken")) {
      window.location.pathname = "/"
    }
  }

  const handleSignOut = () => {
    window.localStorage.removeItem("dailyUserToken")
    setUser(null)
  }

  if (!user) {
    return (
      <>
        <Auth handleLogin={handleLogin} />
      </>
    )
  }

  if (window.location.pathname === "/auth" && user) {
    window.location.pathname = "/"
  }

  return (
    <>

    </>
  )
}
