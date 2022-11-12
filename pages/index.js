import Image from 'next/image'
import { Button } from '@material-ui/core'
import Auth from './auth'
import { useState, useEffect } from 'react';
import Nav from '../components/nav';
import Overview from '../components/overview';
import { Box, Collapse, Fab, Modal, Paper, Slide } from '@mui/material';
import Track from '../components/track';
import { ClearRounded, LogoutRounded } from '@mui/icons-material';
import styles from '../styles/Home.module.css'

export default function Home({ user, setUser }) {
  const [show, setShow] = useState(false)
  const [page, setPage] = useState('overview')
  const [logoutModal, setLogoutModal] = useState(true)

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

      case 'logout':
        return (
          <>
            <Modal open={true} closeAfterTransition onClose={() => {
             setLogoutModal(false)
             setPage('overview')
             }}>
              <Slide in direction='up'>
                <Box sx={{width:'100%', display:'flex', justifyContent:'center',
                 height:'100%', alignItems:'center'}}>
                  <Paper elevation={3} sx={{height:'25%', borderRadius:'1rem',
                   margin:'0 2rem', display:'flex', flexDirection:'column',
                   justifyContent:'center', alignItems:'center', padding:'1rem'}}>

                    <h4 className='mb-4 text-center'>
                      Are you sure you want to logout?
                    </h4>

                    <div className='d-flex w-100 justify-content-evenly'>
                      <Fab size='medium' color='error' variant='extended'
                       onClick={() => setLogoutModal(false)}>
                        <div className={styles.fab}>
                          <ClearRounded style={{marginRight:'0.5rem'}} />
                          No
                        </div>
                      </Fab>

                      <Fab size='medium' color='primary' variant='extended'>
                        <div className={styles.fab}>
                          <LogoutRounded style={{ marginRight: '0.5rem' }} />
                          Yes
                        </div>
                      </Fab>
                    </div>

                  </Paper>
                </Box>
              </Slide>
            </Modal>
          </>
        )
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
      <Nav page={page} setPage={setPage} />

      <div className='container'>
        {
          handleSwitch(page)
        }
      </div>

    </Collapse>
  )

}
