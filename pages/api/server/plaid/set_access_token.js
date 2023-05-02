import {
  PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, PLAID_PRODUCTS, PLAID_COUNTRY_CODES,
  PLAID_REDIRECT_URI, PLAID_ANDROID_PACKAGE_NAME, configuration, client,
  prettyPrintResponse
} from './index';

export let ACCESS_TOKEN = null
let PUBLIC_TOKEN = null
export let ITEM_ID = null

//problem with ACCESS_TOKEN here is that it is not saved and reverts back to null

export default function handler (request, response, next) {
  PUBLIC_TOKEN = request.body.public_token;
  Promise.resolve()
    .then(async function () {
      const tokenResponse = await client.itemPublicTokenExchange({
        public_token: PUBLIC_TOKEN,
      });
      prettyPrintResponse(tokenResponse);
      ACCESS_TOKEN = tokenResponse.data.access_token;
      ITEM_ID = tokenResponse.data.item_id;
      // if (PLAID_PRODUCTS.includes(Products.Transfer)) {
      //   TRANSFER_ID = await authorizeAndCreateTransfer(ACCESS_TOKEN);
      // }
      response.json({
        // the 'access_token' is a private token, DO NOT pass this token to the frontend in your production environment
        access_token: ACCESS_TOKEN,
        item_id: ITEM_ID,
        error: null,
      });
    })
    .catch(next);
}

// Exchange token flow - exchange a Link public_token for
// an API access_token
// https://plaid.com/docs/#exchange-token-flow



// This is a helper function to authorize and create a Transfer after successful
// exchange of a public_token for an access_token. The TRANSFER_ID is then used
// to obtain the data about that particular Transfer.

const authorizeAndCreateTransfer = async (accessToken) => {
  // We call /accounts/get to obtain first account_id - in production,
  // account_id's should be persisted in a data store and retrieved
  // from there.
  const accountsResponse = await client.accountsGet({
    access_token: accessToken,
  });
  const accountId = accountsResponse.data.accounts[0].account_id;

  const transferAuthorizationResponse =
    await client.transferAuthorizationCreate({
      access_token: accessToken,
      account_id: accountId,
      type: 'credit',
      network: 'ach',
      amount: '1.34',
      ach_class: 'ppd',
      user: {
        legal_name: 'FirstName LastName',
        email_address: 'foobar@email.com',
        address: {
          street: '123 Main St.',
          city: 'San Francisco',
          region: 'CA',
          postal_code: '94053',
          country: 'US',
        },
      },
    });
  prettyPrintResponse(transferAuthorizationResponse);
  const authorizationId = transferAuthorizationResponse.data.authorization.id;

  const transferResponse = await client.transferCreate({
    idempotency_key: '1223abc456xyz7890001',
    access_token: accessToken,
    account_id: accountId,
    authorization_id: authorizationId,
    type: 'credit',
    network: 'ach',
    amount: '12.34',
    description: 'Payment',
    ach_class: 'ppd',
    user: {
      legal_name: 'FirstName LastName',
      email_address: 'foobar@email.com',
      address: {
        street: '123 Main St.',
        city: 'San Francisco',
        region: 'CA',
        postal_code: '94053',
        country: 'US',
      },
    },
  });
  prettyPrintResponse(transferResponse);
  return transferResponse.data.transfer.id;
};
