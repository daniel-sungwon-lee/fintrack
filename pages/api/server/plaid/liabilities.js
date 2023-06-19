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
      const liabilitiesResponse = await client.liabilitiesGet({
        access_token: access_token,
      });
      prettyPrintResponse(liabilitiesResponse);
      response.json({ error: null, liabilities: liabilitiesResponse.data });
    })
    .catch(next);
}

// Retrieve Liabilities for an Item
// https://plaid.com/docs/#liabilities
