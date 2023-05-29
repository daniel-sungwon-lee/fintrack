import db from '../index'

export default function handler(req, res) {
  const { params, update } = req.query
  const trackerId = parseInt(params[0]) //trackerId will always be the first paramter value in URL
  const transactionId = params[1]

  if(req.method === 'DELETE') {
    if(params.length === 2) {
      const sql = `
        delete from "transactions"
        where "transaction_id" = $1
        and "trackerId" = $2
      `
      const params = [transactionId, trackerId]

      db.query(sql, params)
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
        delete from "transactions"
        where "trackerId" = $1
      `
      const param = [trackerId]

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

  } else if(req.method === 'PATCH') {
    if(update === 'category') {
      const {newCategory} = req.body

      const sql = `
        update "transactions"
        set "category" = $1
        where "transaction_id" = $2
        and "trackerId" = $3
      `
      const params = [newCategory, transactionId, trackerId]

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
      const {newName} = req.body

      const sql = `
        update "transactions"
        set "name" = $1
        where "transaction_id" = $2
        and "trackerId" = $3
      `
      const params = [newName, transactionId, trackerId]

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
    }

  } else {
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
}
