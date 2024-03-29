import db from '../index'

export default function handler(req, res) {
  const { params, postPost, update } = req.query
  const userId = parseInt(params[0]) //userId will always be the first paramter value in URL
  const trackerId = parseInt(params[1])

  if(req.method === 'DELETE') {
    const sql = `
      delete from "trackers"
      where "userId" = $1
      and "trackerId" = $2
    `
    const params = [userId, trackerId]

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

  } else if(req.method === 'PATCH') {
    if(update === 'total') {
      const {newTotal} = req.body

      const sql = `
        update "trackers"
        set "total" = $1
        where "userId" = $2
        and "trackerId" = $3
      `
      const params = [newTotal, userId, trackerId]

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
      const { newName, newFromDate, newToDate } = req.body

      const sql = `
        update "trackers"
        set "name" = $1, "fromDate" = $2, "toDate" = $3
        where "userId" = $4
        and "trackerId" = $5
      `
      const params = [newName, newFromDate, newToDate, userId, trackerId]

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
    if(params.length === 2) {
      const sql = `
        select "total" from "trackers"
        where "userId" = $1
        and "trackerId" = $2
      `
      const params = [userId, trackerId]

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
      const sql = `
        select * from "trackers"
        where "userId" = $1
        order by "trackerId" desc
      `
      const param = [userId]

      db.query(sql, param)
        .then(result => {
          if(postPost === "true") {
            res.status(200).json(result.rows[0])

          } else {
            res.status(200).json(result.rows)
          }
        })
        .catch(err => {
          console.error(err)
          res.status(500).json({
            error: 'an unexpected error occurred'
          })
        })
    }
  }
}
