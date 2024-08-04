import db from '../index'

export default function handler(req, res) {
  const { params, rowType } = req.query
  const userId = parseInt(params[0])
  const budgetId = parseInt(params[1])

  if(req.method === 'PATCH') {
    if(rowType === 'group') {
      const {updatedRows} = req.body

      const sql = `
        update "budgets"
        set "rows" = $1
        where "userId" = $2
        and "budgetId" = $3
      `
      const params = [JSON.stringify(updatedRows), userId, budgetId]

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

    } else if(rowType === 'category') {
      const {updatedRows} = req.body

      const sql = `
        update "budgets"
        set "rows" = $1
        where "userId" = $2
        and "budgetId" = $3
      `
      const params = [JSON.stringify(updatedRows), userId, budgetId]

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
      const {defaultRows} = req.body

      const sql = `
        update "budgets"
        set "rows" = $1
        where "userId" = $2
        and "budgetId" = $3
      `
      const params = [JSON.stringify(defaultRows), userId, budgetId]

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
}
