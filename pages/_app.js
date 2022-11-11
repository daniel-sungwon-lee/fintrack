import '../styles/globals.css';
import Head from 'next/head';
import Script from 'next/script';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: "#00C169"
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

  useEffect(() => {
    const token = window.localStorage.getItem("finTrackUserToken")
    const user = token ? decodeToken(token) : null

    setUser(user)
  }, [])

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
