import {
  PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, PLAID_PRODUCTS, PLAID_COUNTRY_CODES,
  PLAID_REDIRECT_URI, PLAID_ANDROID_PACKAGE_NAME, configuration, client,
  prettyPrintResponse, decodeAccessToken
} from './index';
import { ACCESS_TOKEN } from './set_access_token';

import db from '../index'

export default function handler (request, response, next) {
  const { accessToken } = request.query
  const access_token = decodeAccessToken(accessToken)

  Promise.resolve()
    .then(async function () {
      const itemResponse = await client.itemGet({
        access_token: access_token
      })

      if(itemResponse.data.item.billed_products.includes('auth')){
        const authResponse = await client.authGet({
          access_token: access_token,
        });
        prettyPrintResponse(authResponse);
        response.json(authResponse.data);

        //added code below for posting accounts data
        await authResponse.data.accounts.map(async account => {
          //liabilities accounts
          if(account.type === 'credit' || account.type === 'loan'){
            const liabilitiesResponse = await client.liabilitiesGet({
              access_token: access_token,
            });

            if(account.subtype === 'credit card'){
              const index = liabilitiesResponse.data.liabilities.credit.map(a => a.account_id).indexOf(account.account_id)

              const accountData = {
                account_id: account.account_id,
                item_id: authResponse.data.item.item_id,
                name: account.name,
                type: account.type,
                subtype: account.subtype,
                balance: account.balances.current,
                account_num: null,
                routing_num: null,
                limit: account.balances.limit,
                next_payment_due_date: liabilitiesResponse.data.liabilities.credit[index].next_payment_due_date,
                last_statement_balance: liabilitiesResponse.data.liabilities.credit[index].last_statement_balance,
                minimum_payment_amount: liabilitiesResponse.data.liabilities.credit[index].minimum_payment_amount,
                next_monthly_payment: null,
                interest_rate: null,
              }

              const check = `
                select "account_id" from "accounts"
              `
              db.query(check)
                .then(result => {
                  if (result.rows.length === 0) {
                    const sql = `
                      insert into "accounts" ("account_id", "item_id", "name", "type", "subtype", "balance",
                      "account_num", "routing_num", "limit", "next_payment_due_date", "last_statement_balance",
                      "minimum_payment_amount", "next_monthly_payment", "interest_rate")
                      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    `
                    const params = [accountData.account_id, accountData.item_id, accountData.name,
                    accountData.type, accountData.subtype, accountData.balance, accountData.account_num,
                    accountData.routing_num, accountData.limit, accountData.next_payment_due_date,
                    accountData.last_statement_balance, accountData.minimum_payment_amount, accountData.next_monthly_payment,
                    accountData.interest_rate]

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
                      const { account_id } = obj

                      if (accountData.account_id === account_id) {
                        console.log('Account already exists')
                        //response.status(201).json("Account already exists")

                      } else {
                        const sql = `
                          insert into "accounts" ("account_id", "item_id", "name", "type", "subtype", "balance",
                          "account_num", "routing_num", "limit", "next_payment_due_date", "last_statement_balance",
                          "minimum_payment_amount", "next_monthly_payment", "interest_rate")
                          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                        `
                        const params = [accountData.account_id, accountData.item_id, accountData.name,
                        accountData.type, accountData.subtype, accountData.balance, accountData.account_num,
                        accountData.routing_num, accountData.limit, accountData.next_payment_due_date,
                        accountData.last_statement_balance, accountData.minimum_payment_amount, accountData.next_monthly_payment,
                        accountData.interest_rate]

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

            } else if(account.subtype === 'student') {
              const index = liabilitiesResponse.data.liabilities.student.map(a => a.account_id).indexOf(account.account_id)

              const accountData = {
                account_id: account.account_id,
                item_id: authResponse.data.item.item_id,
                name: account.name,
                type: account.type,
                subtype: account.subtype,
                balance: account.balances.current,
                account_num: null,
                routing_num: null,
                limit: account.balances.limit,
                next_payment_due_date: liabilitiesResponse.data.liabilities.student[index].next_payment_due_date,
                last_statement_balance: liabilitiesResponse.data.liabilities.student[index].last_statement_balance,
                minimum_payment_amount: liabilitiesResponse.data.liabilities.student[index].minimum_payment_amount,
                next_monthly_payment: null,
                interest_rate: liabilitiesResponse.data.liabilities.student[index].interest_rate_percentage,
              }

              const check = `
                select "account_id" from "accounts"
              `
              db.query(check)
                .then(result => {
                  if (result.rows.length === 0) {
                    const sql = `
                      insert into "accounts" ("account_id", "item_id", "name", "type", "subtype", "balance",
                      "account_num", "routing_num", "limit", "next_payment_due_date", "last_statement_balance",
                      "minimum_payment_amount", "next_monthly_payment", "interest_rate")
                      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    `
                    const params = [accountData.account_id, accountData.item_id, accountData.name,
                    accountData.type, accountData.subtype, accountData.balance, accountData.account_num,
                    accountData.routing_num, accountData.limit, accountData.next_payment_due_date,
                    accountData.last_statement_balance, accountData.minimum_payment_amount, accountData.next_monthly_payment,
                    accountData.interest_rate]

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
                      const { account_id } = obj

                      if (accountData.account_id === account_id) {
                        console.log('Account already exists')
                        //response.status(201).json("Account already exists")

                      } else {
                        const sql = `
                          insert into "accounts" ("account_id", "item_id", "name", "type", "subtype", "balance",
                          "account_num", "routing_num", "limit", "next_payment_due_date", "last_statement_balance",
                          "minimum_payment_amount", "next_monthly_payment", "interest_rate")
                          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                        `
                        const params = [accountData.account_id, accountData.item_id, accountData.name,
                        accountData.type, accountData.subtype, accountData.balance, accountData.account_num,
                        accountData.routing_num, accountData.limit, accountData.next_payment_due_date,
                        accountData.last_statement_balance, accountData.minimum_payment_amount, accountData.next_monthly_payment,
                        accountData.interest_rate]

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

            } else if(account.subtype === 'mortgage') {
              const index = liabilitiesResponse.data.liabilities.mortgage.map(a => a.account_id).indexOf(account.account_id)

              const accountData = {
                account_id: account.account_id,
                item_id: authResponse.data.item.item_id,
                name: account.name,
                type: account.type,
                subtype: account.subtype,
                balance: account.balances.current,
                account_num: null,
                routing_num: null,
                limit: account.balances.limit,
                next_payment_due_date: liabilitiesResponse.data.liabilities.mortgage[index].next_payment_due_date,
                last_statement_balance: null,
                minimum_payment_amount: null,
                next_monthly_payment: liabilitiesResponse.data.liabilities.mortgage[index].next_monthly_payment,
                interest_rate: liabilitiesResponse.data.liabilities.mortgage[index].interest_rate.percentage,
              }

              const check = `
                select "account_id" from "accounts"
              `
              db.query(check)
                .then(result => {
                  if (result.rows.length === 0) {
                    const sql = `
                      insert into "accounts" ("account_id", "item_id", "name", "type", "subtype", "balance",
                      "account_num", "routing_num", "limit", "next_payment_due_date", "last_statement_balance",
                      "minimum_payment_amount", "next_monthly_payment", "interest_rate")
                      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    `
                    const params = [accountData.account_id, accountData.item_id, accountData.name,
                    accountData.type, accountData.subtype, accountData.balance, accountData.account_num,
                    accountData.routing_num, accountData.limit, accountData.next_payment_due_date,
                    accountData.last_statement_balance, accountData.minimum_payment_amount, accountData.next_monthly_payment,
                    accountData.interest_rate]

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
                      const { account_id } = obj

                      if (accountData.account_id === account_id) {
                        console.log('Account already exists')
                        //response.status(201).json("Account already exists")

                      } else {
                        const sql = `
                          insert into "accounts" ("account_id", "item_id", "name", "type", "subtype", "balance",
                          "account_num", "routing_num", "limit", "next_payment_due_date", "last_statement_balance",
                          "minimum_payment_amount", "next_monthly_payment", "interest_rate")
                          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                        `
                        const params = [accountData.account_id, accountData.item_id, accountData.name,
                        accountData.type, accountData.subtype, accountData.balance, accountData.account_num,
                        accountData.routing_num, accountData.limit, accountData.next_payment_due_date,
                        accountData.last_statement_balance, accountData.minimum_payment_amount, accountData.next_monthly_payment,
                        accountData.interest_rate]

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
            }
            //depository accounts
          } else if(account.type === 'depository') {
            //checking/savings accounts
            if(account.subtype === 'checking' || account.subtype === 'savings'){
              const index = authResponse.data.numbers.ach.map(a => a.account_id).indexOf(account.account_id)
              const accountNumber = authResponse.data.numbers.ach[index].account
              const routingNumber = authResponse.data.numbers.ach[index].routing

              const accountData = {
                account_id: account.account_id,
                item_id: authResponse.data.item.item_id,
                name: account.name,
                type: account.type,
                subtype: account.subtype,
                balance: account.balances.current,
                account_num: accountNumber,
                routing_num: routingNumber,
                limit: account.balances.limit,
                next_payment_due_date: null,
                last_statement_balance: null,
                minimum_payment_amount: null,
                next_monthly_payment: null,
                interest_rate: null,
              }

              const check = `
                select "account_id" from "accounts"
              `
              db.query(check)
                .then(result => {
                  if (result.rows.length === 0) {
                    const sql = `
                      insert into "accounts" ("account_id", "item_id", "name", "type", "subtype", "balance",
                      "account_num", "routing_num", "limit", "next_payment_due_date", "last_statement_balance",
                      "minimum_payment_amount", "next_monthly_payment", "interest_rate")
                      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    `
                    const params = [accountData.account_id, accountData.item_id, accountData.name,
                    accountData.type, accountData.subtype, accountData.balance, accountData.account_num,
                    accountData.routing_num, accountData.limit, accountData.next_payment_due_date,
                    accountData.last_statement_balance, accountData.minimum_payment_amount, accountData.next_monthly_payment,
                    accountData.interest_rate]

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
                      const { account_id } = obj

                      if (accountData.account_id === account_id) {
                        console.log('Account already exists')
                        //response.status(201).json("Account already exists")

                      } else {
                        const sql = `
                          insert into "accounts" ("account_id", "item_id", "name", "type", "subtype", "balance",
                          "account_num", "routing_num", "limit", "next_payment_due_date", "last_statement_balance",
                          "minimum_payment_amount", "next_monthly_payment", "interest_rate")
                          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                        `
                        const params = [accountData.account_id, accountData.item_id, accountData.name,
                        accountData.type, accountData.subtype, accountData.balance, accountData.account_num,
                        accountData.routing_num, accountData.limit, accountData.next_payment_due_date,
                        accountData.last_statement_balance, accountData.minimum_payment_amount, accountData.next_monthly_payment,
                        accountData.interest_rate]

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

            //other accounts (money market, CDs)
            } else {
              const accountData = {
                account_id: account.account_id,
                item_id: authResponse.data.item.item_id,
                name: account.name,
                type: account.type,
                subtype: account.subtype,
                balance: account.balances.current,
                account_num: null,
                routing_num: null,
                limit: account.balances.limit,
                next_payment_due_date: null,
                last_statement_balance: null,
                minimum_payment_amount: null,
                next_monthly_payment: null,
                interest_rate: null,
              }

              const check = `
                select "account_id" from "accounts"
              `
              db.query(check)
                .then(result => {
                  if (result.rows.length === 0) {
                    const sql = `
                      insert into "accounts" ("account_id", "item_id", "name", "type", "subtype", "balance",
                      "account_num", "routing_num", "limit", "next_payment_due_date", "last_statement_balance",
                      "minimum_payment_amount", "next_monthly_payment", "interest_rate")
                      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    `
                    const params = [accountData.account_id, accountData.item_id, accountData.name,
                    accountData.type, accountData.subtype, accountData.balance, accountData.account_num,
                    accountData.routing_num, accountData.limit, accountData.next_payment_due_date,
                    accountData.last_statement_balance, accountData.minimum_payment_amount, accountData.next_monthly_payment,
                    accountData.interest_rate]

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
                      const { account_id } = obj

                      if (accountData.account_id === account_id) {
                        console.log('Account already exists')
                        //response.status(201).json("Account already exists")

                      } else {
                        const sql = `
                          insert into "accounts" ("account_id", "item_id", "name", "type", "subtype", "balance",
                          "account_num", "routing_num", "limit", "next_payment_due_date", "last_statement_balance",
                          "minimum_payment_amount", "next_monthly_payment", "interest_rate")
                          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                        `
                        const params = [accountData.account_id, accountData.item_id, accountData.name,
                        accountData.type, accountData.subtype, accountData.balance, accountData.account_num,
                        accountData.routing_num, accountData.limit, accountData.next_payment_due_date,
                        accountData.last_statement_balance, accountData.minimum_payment_amount, accountData.next_monthly_payment,
                        accountData.interest_rate]

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
            }
          }
        })

      } else {
        //liabilities only (no auth in item products array)
        const liabilitiesResponse = await client.liabilitiesGet({
          access_token: access_token,
        });
        prettyPrintResponse(liabilitiesResponse);
        response.json(liabilitiesResponse.data);

        //added code below for posting accounts data
        await liabilitiesResponse.data.accounts.map(async account => {
          //liabilities accounts
          if (account.type === 'credit' || account.type === 'loan') {
            if (account.subtype === 'credit card') {
              const index = liabilitiesResponse.data.liabilities.credit.map(a => a.account_id).indexOf(account.account_id)

              const accountData = {
                account_id: account.account_id,
                item_id: liabilitiesResponse.data.item.item_id,
                name: account.name,
                type: account.type,
                subtype: account.subtype,
                balance: account.balances.current,
                account_num: null,
                routing_num: null,
                limit: account.balances.limit,
                next_payment_due_date: liabilitiesResponse.data.liabilities.credit[index].next_payment_due_date,
                last_statement_balance: liabilitiesResponse.data.liabilities.credit[index].last_statement_balance,
                minimum_payment_amount: liabilitiesResponse.data.liabilities.credit[index].minimum_payment_amount,
                next_monthly_payment: null,
                interest_rate: null,
              }

              const check = `
              select "account_id" from "accounts"
            `
              db.query(check)
                .then(result => {
                  if (result.rows.length === 0) {
                    const sql = `
                    insert into "accounts" ("account_id", "item_id", "name", "type", "subtype", "balance",
                    "account_num", "routing_num", "limit", "next_payment_due_date", "last_statement_balance",
                    "minimum_payment_amount", "next_monthly_payment", "interest_rate")
                    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                  `
                    const params = [accountData.account_id, accountData.item_id, accountData.name,
                    accountData.type, accountData.subtype, accountData.balance, accountData.account_num,
                    accountData.routing_num, accountData.limit, accountData.next_payment_due_date,
                    accountData.last_statement_balance, accountData.minimum_payment_amount, accountData.next_monthly_payment,
                    accountData.interest_rate]

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
                      const { account_id } = obj

                      if (accountData.account_id === account_id) {
                        console.log('Account already exists')
                        //response.status(201).json("Account already exists")

                      } else {
                        const sql = `
                        insert into "accounts" ("account_id", "item_id", "name", "type", "subtype", "balance",
                        "account_num", "routing_num", "limit", "next_payment_due_date", "last_statement_balance",
                        "minimum_payment_amount", "next_monthly_payment", "interest_rate")
                        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                      `
                        const params = [accountData.account_id, accountData.item_id, accountData.name,
                        accountData.type, accountData.subtype, accountData.balance, accountData.account_num,
                        accountData.routing_num, accountData.limit, accountData.next_payment_due_date,
                        accountData.last_statement_balance, accountData.minimum_payment_amount, accountData.next_monthly_payment,
                        accountData.interest_rate]

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

            } else if (account.subtype === 'student') {
              const index = liabilitiesResponse.data.liabilities.student.map(a => a.account_id).indexOf(account.account_id)

              const accountData = {
                account_id: account.account_id,
                item_id: liabilitiesResponse.data.item.item_id,
                name: account.name,
                type: account.type,
                subtype: account.subtype,
                balance: account.balances.current,
                account_num: null,
                routing_num: null,
                limit: account.balances.limit,
                next_payment_due_date: liabilitiesResponse.data.liabilities.student[index].next_payment_due_date,
                last_statement_balance: liabilitiesResponse.data.liabilities.student[index].last_statement_balance,
                minimum_payment_amount: liabilitiesResponse.data.liabilities.student[index].minimum_payment_amount,
                next_monthly_payment: null,
                interest_rate: liabilitiesResponse.data.liabilities.student[index].interest_rate_percentage,
              }

              const check = `
              select "account_id" from "accounts"
            `
              db.query(check)
                .then(result => {
                  if (result.rows.length === 0) {
                    const sql = `
                    insert into "accounts" ("account_id", "item_id", "name", "type", "subtype", "balance",
                    "account_num", "routing_num", "limit", "next_payment_due_date", "last_statement_balance",
                    "minimum_payment_amount", "next_monthly_payment", "interest_rate")
                    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                  `
                    const params = [accountData.account_id, accountData.item_id, accountData.name,
                    accountData.type, accountData.subtype, accountData.balance, accountData.account_num,
                    accountData.routing_num, accountData.limit, accountData.next_payment_due_date,
                    accountData.last_statement_balance, accountData.minimum_payment_amount, accountData.next_monthly_payment,
                    accountData.interest_rate]

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
                      const { account_id } = obj

                      if (accountData.account_id === account_id) {
                        console.log('Account already exists')
                        //response.status(201).json("Account already exists")

                      } else {
                        const sql = `
                        insert into "accounts" ("account_id", "item_id", "name", "type", "subtype", "balance",
                        "account_num", "routing_num", "limit", "next_payment_due_date", "last_statement_balance",
                        "minimum_payment_amount", "next_monthly_payment", "interest_rate")
                        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                      `
                        const params = [accountData.account_id, accountData.item_id, accountData.name,
                        accountData.type, accountData.subtype, accountData.balance, accountData.account_num,
                        accountData.routing_num, accountData.limit, accountData.next_payment_due_date,
                        accountData.last_statement_balance, accountData.minimum_payment_amount, accountData.next_monthly_payment,
                        accountData.interest_rate]

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

            } else if (account.subtype === 'mortgage') {
              const index = liabilitiesResponse.data.liabilities.mortgage.map(a => a.account_id).indexOf(account.account_id)

              const accountData = {
                account_id: account.account_id,
                item_id: liabilitiesResponse.data.item.item_id,
                name: account.name,
                type: account.type,
                subtype: account.subtype,
                balance: account.balances.current,
                account_num: null,
                routing_num: null,
                limit: account.balances.limit,
                next_payment_due_date: liabilitiesResponse.data.liabilities.mortgage[index].next_payment_due_date,
                last_statement_balance: null,
                minimum_payment_amount: null,
                next_monthly_payment: liabilitiesResponse.data.liabilities.mortgage[index].next_monthly_payment,
                interest_rate: liabilitiesResponse.data.liabilities.mortgage[index].interest_rate.percentage,
              }

              const check = `
              select "account_id" from "accounts"
            `
              db.query(check)
                .then(result => {
                  if (result.rows.length === 0) {
                    const sql = `
                    insert into "accounts" ("account_id", "item_id", "name", "type", "subtype", "balance",
                    "account_num", "routing_num", "limit", "next_payment_due_date", "last_statement_balance",
                    "minimum_payment_amount", "next_monthly_payment", "interest_rate")
                    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                  `
                    const params = [accountData.account_id, accountData.item_id, accountData.name,
                    accountData.type, accountData.subtype, accountData.balance, accountData.account_num,
                    accountData.routing_num, accountData.limit, accountData.next_payment_due_date,
                    accountData.last_statement_balance, accountData.minimum_payment_amount, accountData.next_monthly_payment,
                    accountData.interest_rate]

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
                      const { account_id } = obj

                      if (accountData.account_id === account_id) {
                        console.log('Account already exists')
                        //response.status(201).json("Account already exists")

                      } else {
                        const sql = `
                        insert into "accounts" ("account_id", "item_id", "name", "type", "subtype", "balance",
                        "account_num", "routing_num", "limit", "next_payment_due_date", "last_statement_balance",
                        "minimum_payment_amount", "next_monthly_payment", "interest_rate")
                        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                      `
                        const params = [accountData.account_id, accountData.item_id, accountData.name,
                        accountData.type, accountData.subtype, accountData.balance, accountData.account_num,
                        accountData.routing_num, accountData.limit, accountData.next_payment_due_date,
                        accountData.last_statement_balance, accountData.minimum_payment_amount, accountData.next_monthly_payment,
                        accountData.interest_rate]

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
            }
          }
        })
      }
    })
    .catch(next);
}

// Retrieve ACH or ETF Auth data for an Item's accounts
// https://plaid.com/docs/#auth
