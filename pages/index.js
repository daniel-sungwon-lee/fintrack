import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Button } from '@material-ui/core'
import Auth from './auth'
import { useState, useEffect } from 'react';
import Nav from '../components/nav';

export default function Home({ user, setUser }) {
  const handleSignOut = () => {
    window.localStorage.removeItem("finTrackUserToken")
    setUser(null)
  }

  if (!user) {
    return (
      <>
        <Auth setUser={setUser} />
      </>
    )
  }

  return (
    <>
      <Nav />
      <div className='container'>


      </div>
    </>
  )

}
