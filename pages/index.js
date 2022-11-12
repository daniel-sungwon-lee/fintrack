import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Button } from '@material-ui/core'
import Auth from './auth'
import { useState, useEffect } from 'react';
import Nav from '../components/nav';
import Overview from '../components/overview';
import { Collapse } from '@mui/material';
import Track from '../components/track';

export default function Home({ user, setUser }) {
  const [show, setShow] = useState(false)
  const [page, setPage] = useState('overview')

  useEffect(() => {
    setTimeout(() => setShow(true), 300)
  })

  const handleSwitch = (page) => {
    switch(page) {
      case 'overview':
        return <Overview />
        break;

      case 'track':
        return <Track />
        break;

      default:
        return <Overview />
    }
  }

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
    <Collapse in={show}>
      <Nav setPage={setPage} />

      <div className='container'>
        {
          handleSwitch(page)
        }
      </div>

    </Collapse>
  )

}
