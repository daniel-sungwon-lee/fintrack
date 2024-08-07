import React, { useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";

//added custom button
import { Fab, CircularProgress, Box } from "@mui/material";
import { AccountBalanceRounded } from "@mui/icons-material"

const jwt = require('jsonwebtoken')

const Link = ({ userId, setAccountsPlaceholder, setData, setNewData, dispatch, isPaymentInitiation, linkToken }) => {

  const onSuccess = React.useCallback(
    (public_token: string) => {

      setAccountsPlaceholder(true)
      setData(null)
      setNewData(true)

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

        const {access_token} = data

        //getting name of institution
        const quickEncrypt = jwt.sign({ access_token }, 'e3675f6c-9eca-4d72-a241-f3f8ebfda65d')
        await fetch(`/api/server/plaid/item?accessToken=${quickEncrypt}`, { method: "GET" })
          .then(res => res.json())
          .then(async result => {
            const newData = {
              item_id: data.item_id,
              access_token: data.access_token,
              userId: userId,
              name: result.institution.name
            }

            //checking if new institution(name) exists in current institutions table to prevent duplicates
            await fetch(`/api/server/institutions/${userId}?name=${newData.name}`)
              .then(res => res.json())
              .then(async result => {
                if(result.action === 'patch') {
                  //deleting current (now old) accounts info since it is referenced before PATCH
                  await fetch(`/api/server/accounts?item_id=${result.itemId}`, {
                    method: 'DELETE',
                    headers: { "Content-Type": "application/json" }
                  })
                    .then(async () => {
                      //updating existing institution access_token/item_id with new one (PATCH)
                      await fetch(`/api/server/institutions?userId=${userId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newData)
                      })
                        .then(async () => {
                          //getting back the freshly posted institution data for client-side render
                          await fetch(`/api/server/institutions?userId=${userId}`, { method: "GET" })
                            .then(res => res.json())
                            .then(data => {
                              //done!
                              const encryptedData = data.map(data => {
                                const { item_id, access_token, name, userId } = data

                                const encryptedAccessToken = jwt.sign({ access_token }, 'e3675f6c-9eca-4d72-a241-f3f8ebfda65d')

                                const updatedData = {
                                  item_id,
                                  access_token: encryptedAccessToken,
                                  userId,
                                  name
                                }

                                return updatedData
                              })

                              setData(encryptedData)
                              setAccountsPlaceholder(false)
                            })
                            .catch(error => {
                              window.alert(error)
                              console.error(error)
                            })
                        })
                        .catch(error => {
                          window.alert(error)
                          console.error(error)
                        })
                    })
                    .catch(error => {
                      window.alert(error)
                      console.error(error)
                    })

                } else {
                  //posting institution data to institutions table in database
                  await fetch("/api/server/institutions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newData)
                  })
                    .then(async () => {
                      //getting back the freshly posted institution data for client-side render
                      await fetch(`/api/server/institutions?userId=${userId}`, { method: "GET" })
                        .then(res => res.json())
                        .then(data => {
                          //done!
                          const encryptedData = data.map(data => {
                            const { item_id, access_token, name, userId } = data

                            const encryptedAccessToken = jwt.sign({ access_token }, 'e3675f6c-9eca-4d72-a241-f3f8ebfda65d')

                            const updatedData = {
                              item_id,
                              access_token: encryptedAccessToken,
                              userId,
                              name
                            }

                            return updatedData
                          })

                          setData(encryptedData)
                          setAccountsPlaceholder(false)
                        })
                        .catch(error => {
                          window.alert(error)
                          console.error(error)
                        })
                    })
                    .catch((error) => {
                      window.alert(error)
                      console.error(error)
                    })
                }
              })
              .catch((error) => {
                window.alert(error)
                console.error(error)
              })
          })
          .catch((error) => {
            window.alert(error)
            console.error(error)
          })


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
    [dispatch, isPaymentInitiation, setAccountsPlaceholder, setData, setNewData, userId]
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
      <Box className='d-flex align-items-center' sx={{ fontSize: '20px',
       color: 'white', textTransform: 'none',
       lineHeight: 1 }}>
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
      </Box>
    </Fab>
  );
};

Link.displayName = "Link";

export default Link;
