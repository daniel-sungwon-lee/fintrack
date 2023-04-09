import Image from 'next/image'
import { Button } from '@material-ui/core'
import Auth from './auth'
import { useState, useEffect, useContext, useCallback } from 'react';
import Nav from '../components/nav';
import Overview from '../components/overview';
import { Box, Collapse, Fab, Modal, Paper, Slide } from '@mui/material';
import Track from '../components/track';
import { ClearRounded, LogoutRounded } from '@mui/icons-material';
import styles from '../styles/Home.module.css'

//plaid context
import Context from './context.tsx';

export default function Home({ user, setUser }) {
  const [show, setShow] = useState(false)
  const [page, setPage] = useState('overview')
  const [logoutModal, setLogoutModal] = useState(true)

  //plaid context
  const { linkSuccess, isItemAccess, isPaymentInitiation, dispatch } = useContext(Context);
  //plaid info
  const getInfo = useCallback(async () => {
    const response = await fetch("/api/server/plaid/info" /*changed path here*/, { method: "POST" });
    if (!response.ok) {
      dispatch({ type: "SET_STATE", state: { backend: false } });
      return { paymentInitiation: false };
    }
    const data = await response.json();
    const paymentInitiation /*: boolean (removed since tsx?)*/ = data.products.includes(
      "payment_initiation"
    );
    dispatch({
      type: "SET_STATE",
      state: {
        products: data.products,
        isPaymentInitiation: paymentInitiation,
      },
    });
    return { paymentInitiation };
  }, [dispatch]);

  //plaid link token
  const generateToken = useCallback(
    async (isPaymentInitiation) => {
      // Link tokens for 'payment_initiation' use a different creation flow in your backend.
      const path = isPaymentInitiation
        ? "/api/server/plaid/create_link_token_for_payment" //changed path here
        : "/api/server/plaid/create_link_token"; //changed path here
      const response = await fetch(path, {
        method: "POST",
      });
      if (!response.ok) {
        dispatch({ type: "SET_STATE", state: { linkToken: null } });
        return;
      }
      const data = await response.json();
      if (data) {
        if (data.error != null) {
          dispatch({
            type: "SET_STATE",
            state: {
              linkToken: null,
              linkTokenError: data.error,
            },
          });
          return;
        }
        dispatch({ type: "SET_STATE", state: { linkToken: data.link_token } });
      }
      // Save the link_token to be used later in the Oauth flow.
      localStorage.setItem("link_token", data.link_token);
    },
    [dispatch]
  );

  useEffect(() => {
    setTimeout(() => setShow(true), 300)

    //plaid code below
    const init = async () => {
      const { paymentInitiation } = await getInfo(); // used to determine which path to take when generating token
      // do not generate a new token for OAuth redirect; instead
      // setLinkToken from localStorage
      if (window.location.href.includes("?oauth_state_id=")) {
        dispatch({
          type: "SET_STATE",
          state: {
            linkToken: localStorage.getItem("link_token"),
          },
        });
        return;
      }
      generateToken(paymentInitiation);
    };
    init();
  }, [dispatch, generateToken, getInfo])

  const handleSwitch = (page) => {
    switch(page) {
      case 'overview':
        return <Overview />
        break;

      case 'track':
        return <Track />
        break;

      case 'logout':
        if(!logoutModal) {
          setLogoutModal(true)
        }
        return (
          <>
            <Modal open={logoutModal} closeAfterTransition>
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
                       onClick={() => {
                        setLogoutModal(false)
                        setPage('overview')
                       }}>
                        <div className={styles.fab}>
                          <ClearRounded style={{marginRight:'0.5rem'}} />
                          No
                        </div>
                      </Fab>

                      <Fab size='medium' color='primary' variant='extended'
                       onClick={handleSignOut}>
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
    setPage('overview')
  }

  if (!user) {
    return (
      <>
        <Auth setUser={setUser} />
      </>
    )
  }

  return (
    <Collapse in={show} collapsedSize={0}>
      <Nav page={page} setPage={setPage} />

      <div className='container'>
        {
          handleSwitch(page)
        }
      </div>

    </Collapse>
  )

}
