import db from './index.js'

export default function handler(req, res) {
  if (req.method === "POST") {
  //   const { account_id, item_id, name, type, balance, account_num, routing_num } = req.body

  //   const sql = `
  //   insert into "accounts" ("account_id", "item_id", "name", "type", "balance",
  //   "account_num", "routing_num")
  //   values ($1, $2, $3, $4, $5, $6, $7)
  // `
  //   const params = [account_id, item_id, name, type, balance, account_num, routing_num]

  //   db.query(sql, params)
  //     .then(result => {
  //       res.status(201).json(result.rows[0])
  //     })
  //     .catch(err => {
  //       console.error(err);
  //       res.status(500).json({
  //         error: 'an unexpected error occurred'
  //       });
  //     })

  } else if (req.method === "GET") {
    const { item_id } = req.query

    const sql = `
        select * from "accounts"
        where "item_id" = $1
      `
    const params = [item_id]

    db.query(sql, params)
      .then(result => {
        res.status(200).json(result.rows)
      })
      .catch(err => {
        console.error(err)
        res.status(500).json({
          error: 'an unexpected error occurred'
        })
      })
  }
}
