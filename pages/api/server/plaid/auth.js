import {
  PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, PLAID_PRODUCTS, PLAID_COUNTRY_CODES,
  PLAID_REDIRECT_URI, PLAID_ANDROID_PACKAGE_NAME, configuration, client,
  prettyPrintResponse
} from './index';
import { ACCESS_TOKEN } from './set_access_token';

export default function handler (request, response, next) {
  Promise.resolve()
    console.log(ACCESS_TOKEN)
    .then(async function () {
      const authResponse = await client.authGet({
        access_token: ACCESS_TOKEN,
      });
      //prettyPrintResponse(authResponse);
      response.json(authResponse.data);
    })
    .catch(next);
}

// Retrieve ACH or ETF Auth data for an Item's accounts
// https://plaid.com/docs/#auth
