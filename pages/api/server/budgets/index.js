import db from '../index'

export default function handler(req, res) {
  const { userId, name, frequency, fromDate, toDate, rows } = req.body

  const sql = `
  insert into "budgets" ("userId", "name", "frequency", "fromDate", "toDate", "rows")
  values ($1, $2, $3, $4, $5, $6)
`
  const params = [userId, name, frequency, fromDate, toDate, rows]

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
