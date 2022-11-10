import db from './index.js';
import argon2 from 'argon2';
const jwt = require('jsonwebtoken');

class ClientError {
  constructor(status, message) {
    this.status = status;
    this.message = message;
  }
}

export default function handler (req, res) {
  const { email, password } = req.body;

  const sql = `
  select "userId", "hashedPassword", "email"
  from "users"
  where "email" = $1
  `;
  const params = [email];

  db.query(sql, params)
    .then(result => {
      const [user] = result.rows;
      if (!user) {
        throw new ClientError(401, 'Invalid login');
      }
      const { userId, hashedPassword, email } = user;
      argon2
        .verify(hashedPassword, password)
        .then(isMatch => {
          if (!isMatch) {
            throw new ClientError(401, 'Invalid login');
          }
          const payload = { userId, email };
          const token = jwt.sign(payload, process.env.TOKEN_SECRET);
          res.json({ token, user: payload });
        })
        .catch(err => {
          if (err instanceof ClientError) {
            res.status(err.status).json({
              error: err.message
            });
          } else {
            console.error(err);
            res.status(500).json({
              error: 'an unexpected error occurred'
            });
          }
        });
    })
    .catch(err => {
      if (err instanceof ClientError) {
        res.status(err.status).json({
          error: err.message
        });
      } else {
        console.error(err);
        res.status(500).json({
          error: 'an unexpected error occurred'
        });
      }
    });
}
