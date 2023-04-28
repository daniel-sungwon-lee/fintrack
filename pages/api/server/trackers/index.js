import db from '../index'

export default function handler(req, res) {
  const { userId, name, total, fromDate, toDate } = req.body

  const sql = `
  insert into "trackers" ("userId", "name", "total", "fromDate", "toDate")
  values ($1, $2, $3, $4, $5)
`
  const params = [userId, name, total, fromDate, toDate]

  db.query(sql, params)
    .then(result => {
      res.status(201).json(result.rows[0])
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'an unexpected error occurred'
      });
    })
}
