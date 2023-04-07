import '../styles/globals.css';
import Head from 'next/head';
import Script from 'next/script';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useState, useEffect, useContext, useCallback } from 'react';

//plaid context
import Context from '../components/plaid/context.tsx';

const theme = createTheme({
  palette: {
    primary: {
      main: "#00C169"
    },
    secondary: {
      main: "#FFD800"
    }
  }
})

function decodeToken(token) {
  const [, encodedData] = token.split('.');
  const decodedPayload = atob(encodedData);
  const payload = JSON.parse(decodedPayload);
  return payload;
}


function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null)

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
    const token = window.localStorage.getItem("finTrackUserToken")
    const user = token ? decodeToken(token) : null

    setUser(user)

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

  if (user && window.location.pathname === "/auth") {
    window.location.pathname = "/"
  }

  return (
    <>
      <Head>
        <title>FinTrack</title>
        <meta name="description" content="Finance Tracker" />
        <link rel="icon" href="/images/money.svg" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Zenh87qX5JnK2Jl0vWa8Ck2rdkQ2Bzep5IDxbcnCeuOxjzrPF/et3URy9Bv1WTRi" crossOrigin="anonymous" />
      </Head>

      <Script src='https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js' integrity="sha384-OERcA2EqjJCMA+/3y+gxIOqMEjwtxJY7qPCqsdltbNJuaOe923+mo//f6V8Qbsw3" crossorigin="anonymous" />

      <ThemeProvider theme={theme}>
        <Component user={user} setUser={setUser} {...pageProps} />
      </ThemeProvider>
    </>
  )
}

export default MyApp
