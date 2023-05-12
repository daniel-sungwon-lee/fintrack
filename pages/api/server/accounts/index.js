import db from '../index.js'

export default function handler(req, res) {
  const { item_id } = req.query

  if (req.method === "DELETE") {
    const sql = `
      delete from "accounts"
      where "item_id" = $1
    `
    const param = [item_id]

    db.query(sql, param)
      .then(result => {
        res.status(204).json(result.rows[0])
      })
      .catch(err => {
        console.error(err)
        res.status(500).json({
          error: 'an unexpected error occurred'
        })
      });

  } else {
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
