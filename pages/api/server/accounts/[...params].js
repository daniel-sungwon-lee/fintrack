import db from '../index.js'

export default function handler(req, res) {
  const { params } = req.query
  const accountId = params[0]

  if(req.method === 'PATCH') {
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
