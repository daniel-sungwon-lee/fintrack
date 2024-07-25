import db from '../index.js'

export default function handler(req, res) {
  const { params } = req.query
  const accountId = params[0]
  const column = params[1]

  if(req.method === 'PATCH') {
    if(column) {
      //updating holdings data
      const { updatedHoldings } = req.body

      const sql = `
        update "accounts"
        set "holdings" = $1
        where "account_id" = $2
      `
      const params = [JSON.stringify(updatedHoldings), accountId]

      db.query(sql, params)
        .then(result => {
          res.status(200).json(result.rows[0])
        })
        .catch(err => {
          console.error(err)
          res.status(500).json({
            error: 'an unexpected error occurred'
          })
        })

    } else {
      //updating balance
      const { newBalance } = req.body

      const sql = `
        update "accounts"
        set "balance" = $1
        where "account_id" = $2
      `
      const params = [newBalance, accountId]

      db.query(sql, params)
        .then(result => {
          res.status(200).json(result.rows[0])
        })
        .catch(err => {
          console.error(err)
          res.status(500).json({
            error: 'an unexpected error occurred'
          })
        })
    }

  } else {
    const sql = `
          select * from "accounts"
          where "account_id" = $1
        `
    const param = [accountId]

    db.query(sql, param)
      .then(result => {
        res.status(200).json(result.rows[0])
      })
      .catch(err => {
        console.error(err)
        res.status(500).json({
          error: 'an unexpected error occurred'
        })
      })
  }
}
