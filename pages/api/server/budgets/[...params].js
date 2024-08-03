import db from '../index'

export default function handler(req, res) {
  const { params } = req.query
  const userId = parseInt(params[0])

  const sql = `
    select * from "budgets"
    where "userId" = $1
    order by "budgetId" desc
`
  const param = [userId]

  db.query(sql, param)
    .then(result => {
      res.status(200).json(result.rows)
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'an unexpected error occurred'
      });
    })
}
