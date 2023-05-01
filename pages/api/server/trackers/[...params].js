import db from '../index'

export default function handler(req, res) {
  const { params, postPost } = req.query
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
