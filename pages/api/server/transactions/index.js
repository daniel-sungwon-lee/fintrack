import db from '../index'

export default function handler(req, res) {
  const { transaction_id, trackerId, account_id, amount, category,
          date, iso_currency_code, name } = req.body

  const sql = `
  insert into "transactions" ("transaction_id", "trackerId", "account_id",
  "amount", "category", "date", "iso_currency_code", "name")
  values ($1, $2, $3, $4, $5, $6, $7, $8)
`
  const params = [transaction_id, trackerId, account_id, amount, category,
                  date, iso_currency_code, name]

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
