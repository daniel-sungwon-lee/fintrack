import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Button } from '@material-ui/core'
import Auth from './auth'
import { useState, useEffect } from 'react';

export default function Home() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = window.localStorage.getItem("finTrackUserToken")
    const user = token ? decodeToken(token) : null

    setUser(user)
  }, [])

  const handleLogin = (result) => {
    const { user, token } = result

    setUser(user)
    window.localStorage.setItem("finTrackUserToken", token)

    if (window.localStorage.getItem("finTrackUserToken")) {
      window.location.pathname = "/"
    }
  }

  const handleSignOut = () => {
    window.localStorage.removeItem("finTrackUserToken")
    setUser(null)
  }

  if (window.location.pathname === "/auth" && user) {
    window.location.pathname = "/"
  }

  if (!user) {
    return (
      <>
        <Auth handleLoginRoot={handleLogin} />
      </>
    )
  } else {
    return (
      <>
        <div>
          hello
        </div>
      </>
    )
  }

}
