import localFont from 'next/font/local'
import Head from 'next/head';
import Script from 'next/script';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';

//plaid context
import React from "react";
import { createContext, useReducer } from "react";

const initialState = {
  linkSuccess: false,
  isItemAccess: true,
  isPaymentInitiation: false,
  linkToken: "", // Don't set to null or error message will show up briefly when site loads
  accessToken: null,
  itemId: null,
  isError: false,
  backend: true,
  products: ["transactions"],
  linkTokenError: {
    error_type: "",
    error_code: "",
    error_message: "",
  },
};

const Context = createContext(initialState);

const { Provider } = Context;
const PlaidContextProvider = (props) => {
  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_STATE":
        return { ...state, ...action.state };
      default:
        return { ...state };
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  return <Provider value={{ ...state, dispatch }}>{props.children}</Provider>;
};


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

const Inter = localFont({ src: '../public/fonts/Inter-Regular.ttf' })

const globalCss = `
html,
body {
  padding: 0;
  margin: 0;
  font-family: ${Inter.style.fontFamily} !important;
}

a {
  color: inherit;
  text-decoration: none;
  transition: all 0.25s;
}
a:hover {
  color: #FFD800;
}

* {
  box-sizing: border-box;
}

::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb {
  background: #b4b4b4;
  border-radius: 10px;
  border: 2.5px transparent solid;
  background-clip: padding-box;
}
::-webkit-scrollbar-thumb:hover {
  background: #868686;
  border: 0;
}

::selection {
  background: rgb(254, 108, 118);
  color: white;
}


.MuiTypography-root {
  font-family: ${Inter.style.fontFamily} !important;
}

.MuiBottomNavigationAction-label {
  font-family: ${Inter.style.fontFamily} !important;
}

.MuiFormLabel-root.MuiInputLabel-root {
  font-family: ${Inter.style.fontFamily} !important;
}
.MuiInputBase-root.MuiInput-root {
  font-family: ${Inter.style.fontFamily} !important;
}

#password-helper-text {
  margin-top: 1rem;
  margin-bottom: -2.6rem;
  text-align: center;
  font-size: 16px;
  font-family: ${Inter.style.fontFamily} !important;
}

.MuiFormHelperText-root {
  font-family: ${Inter.style.fontFamily} !important;
}

.MuiButtonBase-root.MuiFab-root {
  font-family: ${Inter.style.fontFamily} !important;
}

.MuiButtonBase-root.MuiLoadingButton-root {
  font-family: ${Inter.style.fontFamily} !important;
}

.MuiPickersLayout-root {
  overflow-x: auto !important;
}
.MuiButtonBase-root.MuiPickersDay-root.MuiDateRangePickerDay-day {
  font-family: ${Inter.style.fontFamily} !important;
}
.MuiButtonBase-root.MuiChip-root {
  font-family: ${Inter.style.fontFamily} !important;
  background-color: #FFD800;
}
.MuiButtonBase-root.MuiChip-root:hover {
  background-color: #00C169;
}

.MuiPickersDay-root {
  font-family: ${Inter.style.fontFamily} !important;
}
.MuiPickersYear-yearButton {
  font-family: ${Inter.style.fontFamily} !important;
}
.MuiPickersCalendarHeader-label {
  font-family: ${Inter.style.fontFamily} !important;
}

.track-transactions-list .MuiListItemButton-root {
  border-radius: 1rem;
}

.MuiSpeedDial-root .MuiSpeedDial-actions {
  padding-top: 25px !important;
}

.MuiPaper-root.MuiAlert-root .MuiAlert-message {
  font-family: ${Inter.style.fontFamily} !important;
}

.MuiPopper-root.MuiTooltip-popper, .MuiTooltip-tooltip {
  font-family: ${Inter.style.fontFamily} !important;
  z-index: 1100;
}
#OptionsSpeedDial-action-1 .MuiTooltip-tooltip {
  background-color: #d32f2f;
}
#CategoryOptionsSpeedDial-action-1 .MuiTooltip-tooltip {
  background-color: #d32f2f;
}
#TransactionOptionsSpeedDial-action-1 .MuiTooltip-tooltip {
  background-color: #d32f2f;
}
#CategoryOptionsSpeedDial-action-1, #CategoryOptionsSpeedDial-action-0, #TransactionOptionsSpeedDial-action-1, #TransactionOptionsSpeedDial-action-0 {
  z-index: 1500;
}

.MuiInputBase-input.MuiInput-input.Mui-disabled {
  -webkit-text-fill-color: black;
  cursor: pointer;
}

.MuiButtonBase-root.MuiMenuItem-root {
  font-family: ${Inter.style.fontFamily} !important;
}

.MuiButtonBase-root.MuiButton-root {
  font-family: ${Inter.style.fontFamily} !important;
  text-transform: none;
}

.MuiButtonBase-root.MuiTab-root {
  font-family: ${Inter.style.fontFamily} !important;
  text-transform: none;
}


@media(max-width: 767px) {
  .tracker-fontsize-mobile {
    font-size: 18px !important;
  }
  .tracker-fontsize-mobile-sm {
    font-size: 14px !important;
  }

  .hidden {
    visibility: hidden !important;
  }
}
`

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
        <meta name="title" property="og:title" content="FinTrack" />
        <meta name="description" property="og:description" content="Finance Tracker" />
        <meta name="image" property="og:image" content="/images/money.png" />
        <link rel="icon" href="/images/money.svg" />
      </Head>

      <Script src='https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js' integrity="sha384-OERcA2EqjJCMA+/3y+gxIOqMEjwtxJY7qPCqsdltbNJuaOe923+mo//f6V8Qbsw3" crossorigin="anonymous" />

      <ThemeProvider theme={theme}>
        <PlaidContextProvider>
          <main className={Inter.className}>
            <Component user={user} setUser={setUser} Context={Context} {...pageProps} />
            <style jsx>{globalCss}</style>
          </main>
        </PlaidContextProvider>
      </ThemeProvider>
    </>
  )
}

export default MyApp
