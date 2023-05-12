import db from '../index.js'

export default function handler(req, res) {
  const { params } = req.query
  const accountId = params[0]

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
