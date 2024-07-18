import { PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, PLAID_PRODUCTS, PLAID_COUNTRY_CODES,
        PLAID_REDIRECT_URI, PLAID_ANDROID_PACKAGE_NAME, configuration, client,
        prettyPrintResponse } from './index';

export default function handler (request, response, next) {
  Promise.resolve()
    .then(async function () {
      const configs = {
        user: {
          // This should correspond to a unique id for the current user.
          client_user_id: 'user-id',
        },
        client_name: 'FinTrack',
        products: PLAID_PRODUCTS,
        required_if_supported_products: ['auth','liabilities','investments'],
        transactions: {
          days_requested: 730
        },
        country_codes: PLAID_COUNTRY_CODES,
        language: 'en',
      };

      if (PLAID_REDIRECT_URI !== '') {
        configs.redirect_uri = PLAID_REDIRECT_URI;
      }

      if (PLAID_ANDROID_PACKAGE_NAME !== '') {
        configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
      }
      const createTokenResponse = await client.linkTokenCreate(configs);
      prettyPrintResponse(createTokenResponse);
      response.json(createTokenResponse.data);
    })
    .catch(next);
}

// Create a link token with configs which we can then use to initialize Plaid Link client-side.
// See https://plaid.com/docs/#create-link-token
