import db from '../index'

export default function handler(req, res) {
  const { params, name } = req.query
  const userId = parseInt(params[0]) //userId will always be the first paramter value in URL

  const sql = `
      select "name", "item_id" from "institutions"
      where "userId" = $1
    `
  const param = [userId]

  db.query(sql, param)
    .then(result => {
      if (result.rows.length > 0) {
        const nameArr = result.rows.map(obj => obj.name)
        const index = nameArr.indexOf(name)

        if (index === -1) {
          res.status(200).json({action: 'post'})
        } else {
          const itemId = result.rows[index].item_id
          res.status(200).json({action: 'patch', itemId: itemId})
        }

      } else {
        res.status(200).json({action: 'post'})
      }
      //res.status(200).json(result.rows)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({
        error: 'an unexpected error occurred'
      })
    })
}
