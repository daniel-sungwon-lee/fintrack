import db from '../index'

export default function handler(req, res) {
  const { params } = req.query
  const trackerId = parseInt(params[0]) //trackerId will always be the first paramter value in URL

  const transaction_id = params[1] //may be undefined

  const sql = `
    select * from "transactions"
    where "trackerId" = $1
    order by "date" desc
  `
  const param = [trackerId]

  db.query(sql, param)
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