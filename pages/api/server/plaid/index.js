require('dotenv').config();
const { Configuration, PlaidApi, Products, PlaidEnvironments } = require('plaid');
const util = require('util');

export const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
export const PLAID_SECRET = process.env.PLAID_SECRET;
export const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
export const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || Products.Transactions).split(
  ',',
);
// PLAID_COUNTRY_CODES is a comma-separated list of countries for which users
// will be able to select institutions from.
export const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US').split(
  ',',
);

// Parameters used for the OAuth redirect Link flow.
//
// Set PLAID_REDIRECT_URI to 'http://localhost:3000'
// The OAuth redirect flow requires an endpoint on the developer's website
// that the bank website should redirect to. You will need to configure
// this redirect URI for your client ID through the Plaid developer dashboard
// at https://dashboard.plaid.com/team/api.
export const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';

// Parameter used for OAuth in Android. This should be the package name of your app,
// e.g. com.plaid.linksample
export const PLAID_ANDROID_PACKAGE_NAME = process.env.PLAID_ANDROID_PACKAGE_NAME || '';

// We store the access_token in memory - in production, store it in a secure
// persistent data store
//moved below 3 values to set_access_token.js
//export let ACCESS_TOKEN = null;
//export let PUBLIC_TOKEN = null;
//export let ITEM_ID = null;

// Initialize the Plaid client
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)

export const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

export const client = new PlaidApi(configuration);



export const prettyPrintResponse = (response) => {
  console.log(util.inspect(response.data, { colors: true, depth: 4 }));
};
