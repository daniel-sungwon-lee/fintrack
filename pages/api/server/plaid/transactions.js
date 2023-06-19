import {
  PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, PLAID_PRODUCTS, PLAID_COUNTRY_CODES,
  PLAID_REDIRECT_URI, PLAID_ANDROID_PACKAGE_NAME, configuration, client,
  prettyPrintResponse, decodeAccessToken
} from './index';
import { ACCESS_TOKEN } from './set_access_token';

export default function handler (request, response, next) {
  const { accessToken } = request.query
  const access_token = decodeAccessToken(accessToken)

  Promise.resolve()
    .then(async function () {
      // Set cursor to empty to receive all historical updates
      let cursor = null;

      // New transaction updates since "cursor"
      let added = [];
      let modified = [];
      // Removed transaction ids
      let removed = [];
      let hasMore = true;
      // Iterate through each page of new transaction updates for item
      while (hasMore) {
        const request = {
          access_token: access_token,
          cursor: cursor,
          count: 333
        };
        const response = await client.transactionsSync(request)
        const data = response.data;
        // Add this page of results
        added = added.concat(data.added);
        modified = modified.concat(data.modified);
        removed = removed.concat(data.removed);
        hasMore = data.has_more;
        // Update cursor to the next cursor
        cursor = data.next_cursor;
        prettyPrintResponse(response);
      }

      const compareTxnsByDateDescending = (a, b) => (a.date < b.date) - (a.date > b.date);
      // Return the 200 most recent transactions
      const recently_added = [...added].sort(compareTxnsByDateDescending).slice(0,200);
      response.json({ latest_transactions: recently_added });
    })
    .catch(next);
}

// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
