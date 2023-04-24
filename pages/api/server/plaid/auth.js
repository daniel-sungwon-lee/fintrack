import {
  PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, PLAID_PRODUCTS, PLAID_COUNTRY_CODES,
  PLAID_REDIRECT_URI, PLAID_ANDROID_PACKAGE_NAME, configuration, client,
  prettyPrintResponse
} from './index';
import { ACCESS_TOKEN } from './set_access_token';

import db from '../index'

export default function handler (request, response, next) {
  Promise.resolve()
    .then(async function () {
      const authResponse = await client.authGet({
        access_token: ACCESS_TOKEN,
      });
      prettyPrintResponse(authResponse);
      response.json(authResponse.data);

      //added code below for posting accounts data
      await authResponse.data.accounts.map(account => {
        const index = authResponse.data.numbers.ach.map(a => a.account_id).indexOf(account.account_id)
        const accountNumber = authResponse.data.numbers.ach[index].account
        const routingNumber = authResponse.data.numbers.ach[index].routing

        const accountData = {
          account_id: account.account_id,
          item_id: authResponse.data.item.item_id,
          name: account.name,
          type: account.subtype,
          balance: account.balances.current,
          account_num: accountNumber,
          routing_num: routingNumber
        }

        const check = `
          select "account_id" from "accounts"
        `
        db.query(check)
          .then(result => {
            if(result.rows.length === 0) {
              const sql = `
                insert into "accounts" ("account_id", "item_id", "name", "type", "balance",
                "account_num", "routing_num")
                values ($1, $2, $3, $4, $5, $6, $7)
              `
              const params = [accountData.account_id, accountData.item_id, accountData.name,
              accountData.type, accountData.balance, accountData.account_num, accountData.routing_num]

              db.query(sql, params)
                .then(result => {
                  //response.status(201).json(result.rows[0])
                })
                .catch(err => {
                  console.error(err);
                  // response.status(500).json({
                  //   error: 'an unexpected error occurred'
                  // });
                })
            } else {
              const accountIds = result.rows //array of objects containing account_id

              accountIds.map(obj => {
                const {account_id} = obj

                if(accountData.account_id === account_id) {
                  console.log('Account already exists')
                  //response.status(201).json("Account already exists")

                } else {
                  const sql = `
                    insert into "accounts" ("account_id", "item_id", "name", "type", "balance",
                    "account_num", "routing_num")
                    values ($1, $2, $3, $4, $5, $6, $7)
                  `
                  const params = [accountData.account_id, accountData.item_id, accountData.name,
                  accountData.type, accountData.balance, accountData.account_num, accountData.routing_num]

                  db.query(sql, params)
                    .then(result => {
                      //response.status(201).json(result.rows[0])
                    })
                    .catch(err => {
                      console.error(err);
                      // response.status(500).json({
                      //   error: 'an unexpected error occurred'
                      // });
                    })
                }
              })
            }

          })
          .catch(err => {
            console.error(err);
            response.status(500).json({
              error: 'an unexpected error occurred'
            });
          })
      })
    })
    .catch(next);
}

// Retrieve ACH or ETF Auth data for an Item's accounts
// https://plaid.com/docs/#auth
