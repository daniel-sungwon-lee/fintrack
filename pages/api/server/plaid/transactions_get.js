import {
  PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, PLAID_PRODUCTS, PLAID_COUNTRY_CODES,
  PLAID_REDIRECT_URI, PLAID_ANDROID_PACKAGE_NAME, configuration, client,
  prettyPrintResponse
} from './index';
import { ACCESS_TOKEN } from './set_access_token';

export default function handler (request, response, next) {
  let start_date = request.body.start_date
  let end_date = request.body.end_date

  Promise.resolve()
    .then(async () => {
      const request = {
        access_token: ACCESS_TOKEN,
        start_date: start_date,
        end_date: end_date
      };
      const plaidResponse = await client.transactionsGet(request);
      let transactions = plaidResponse.data.transactions;
      const total_transactions = plaidResponse.data.total_transactions;

      // Manipulate the offset parameter to paginate
      // transactions and retrieve all available data
      while (transactions.length < total_transactions) {
        const paginatedRequest = {
          access_token: ACCESS_TOKEN,
          start_date: '2020-01-01',
          end_date: '2023-02-01',
          options: {
            offset: transactions.length,
          },
        };
        const paginatedResponse = await client.transactionsGet(paginatedRequest);
        transactions = transactions.concat(
          paginatedResponse.data.transactions,
        );

        prettyPrintResponse(transactions)
      }

      response.json({ transactions: transactions })
    })
    .catch(next)
}
