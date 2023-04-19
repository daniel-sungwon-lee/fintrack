import React, { useEffect, useContext } from "react";
import { usePlaidLink } from "react-plaid-link";

//added custom button
import { Fab, CircularProgress } from "@mui/material";
import { AccountBalanceRounded } from "@mui/icons-material"

import Context from "../../pages/context.tsx";
import { Products } from "plaid";

//custom styles
import styles from '../../styles/Home.module.css'

const Link = () => {
  const { linkToken, isPaymentInitiation, dispatch } = useContext(Context);

  const onSuccess = React.useCallback(
    (public_token: string) => {
      // If the access_token is needed, send public_token to server
      const exchangePublicTokenForAccessToken = async () => {
        const response = await fetch("/api/server/plaid/set_access_token" /* changed path */, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: `public_token=${public_token}`,
        });
        if (!response.ok) {
          dispatch({
            type: "SET_STATE",
            state: {
              itemId: `no item_id retrieved`,
              accessToken: `no access_token retrieved`,
              isItemAccess: false,
            },
          });
          return;
        }
        const data = await response.json();
        //console.log('data:',data)
        //access_token and item_id data object here, when successfully connected to new account(s)
        //ready to be stored to context (changes when a new account is connected)
        dispatch({
          type: "SET_STATE",
          state: {
            itemId: data.item_id,
            accessToken: data.access_token,
            isItemAccess: true,
          },
        });
      };

      // 'payment_initiation' products do not require the public_token to be exchanged for an access_token.
      if (isPaymentInitiation) {
        dispatch({ type: "SET_STATE", state: { isItemAccess: false } });
      } else {
        exchangePublicTokenForAccessToken();
      }

      dispatch({ type: "SET_STATE", state: { linkSuccess: true } });
      window.history.pushState("", "", "/");
    },
    [dispatch]
  );

  let isOauth = false;
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken!,
    onSuccess,
  };

  if (window.location.href.includes("?oauth_state_id=")) {
    // TODO: figure out how to delete this ts-ignore
    // @ts-ignore
    config.receivedRedirectUri = window.location.href;
    isOauth = true;
  }

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (isOauth && ready) {
      open();
    }
  }, [ready, open, isOauth]);

  return (
    //custom button (fab)
    <Fab onClick={() => open()} disabled={!ready} variant="extended" size="large"
      color="primary" sx={{ padding: '2rem', borderRadius: '2rem' }}>
      <div className={styles.fab} style={{ fontSize: '20px' }}>
        {
          ready
            ?<>
              <AccountBalanceRounded style={{ marginRight: "0.5rem" }} />
              Connect bank account
             </>
            :<>
              <CircularProgress color="inherit" size={30} sx={{marginRight: '1rem'}}
               thickness={5} />
              Loading...
             </>
        }
      </div>
    </Fab>
  );
};

Link.displayName = "Link";

export default Link;
