import {
  PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, PLAID_PRODUCTS, PLAID_COUNTRY_CODES,
  PLAID_REDIRECT_URI, PLAID_ANDROID_PACKAGE_NAME, configuration, client,
  prettyPrintResponse, decodeAccessToken
} from './index';
import { ACCESS_TOKEN } from "./set_access_token";

export default function handler(request, response, next) {
  const { accessToken } = request.query
  const access_token = decodeAccessToken(accessToken)

  Promise.resolve()
    .then(async function () {
      const balanceResponse = await client.accountsBalanceGet({
        access_token: access_token,
      });
      prettyPrintResponse(balanceResponse);
      response.json(balanceResponse.data);
    })
    .catch(next);
}

// Retrieve real-time Balances for each of an Item's accounts
// https://plaid.com/docs/#balance
