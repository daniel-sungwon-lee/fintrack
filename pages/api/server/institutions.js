import db from './index.js'

export default function handler (req, res) {
  const { item_id, access_token, userId, name } = req.body

  const sql = `
    insert into "institutions" ("item_id", "access_token", "userId", "name")
    values ($1, $2, $3, $4)
  `
  const params = [item_id, access_token, userId, name]

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
