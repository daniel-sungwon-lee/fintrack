import db from '../index'

export default function handler(req, res) {
  if (req.method === "POST") {
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

  } else if (req.method === "GET") {
    const { userId } = req.query

    const sql = `
        select * from "institutions"
        where "userId" = $1
      `
    const params = [userId]

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

  } else if (req.method === "PATCH") {
    const { userId } = req.query
    const { access_token, item_id, name } = req.body

    const sql = `
      update "institutions"
      set "access_token" = $1
      and "item_id" = $2
      where "userId" = $3
      and "name" = $4
    `
    const params = [access_token, item_id, userId, name]

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

  } else if (req.method === "DELETE") {
    const { item_id } = req.query

    const sql = `
      delete from "institutions"
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
  }
}
