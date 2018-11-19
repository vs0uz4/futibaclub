const express = require('express')
const route = express.Router()

const init = connection => {
  route.get('/sign-in', (req, res) => {
    res.render('account/sign-in')
  })

  route.post('/sign-in', async (req, res) => {
    const {
      email,
      passwd
    } = req.body

    const [rows, fields] = await connection.execute('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length !== 0 && rows[0].passwd === passwd) {
      const userDb = rows[0]
      const user = {
        id: userDb.id,
        name: userDb.name,
        role: userDb.role
      }
      req.session.user = user

      res.redirect('/')
    } else {
      res.render('account/sign-in', {
        error: 'Usuário e/ou senha inválidos.',
        email: email,
        passwd: passwd
      })
    }
  })

  route.get('/sign-out', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.log(`Error Destroying Session\nError: ${err.code}\nMessage ${err.message}`)
      }

      res.redirect('/')
    })
  })

  route.get('/new-account', (req, res) => {
    res.render('account/new')
  })

  route.post('/new-account', async (req, res) => {
    const {
      name,
      email,
      passwd
    } = req.body

    const [rows, fields] = await connection.execute('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      const [resultSetHeader, resultSet] = await connection.execute('INSERT INTO users (name, email, passwd, role) VALUES (?, ?, ?, ?)', [
        name,
        email,
        passwd,
        'user'
      ])

      const user = {
        id: resultSetHeader.insertId,
        name: name,
        role: 'user'
      }
      req.session.user = user

      console.log(resultSetHeader)

      res.redirect('/')
    } else {
      res.render('account/new', {
        error: 'Usuário já existente.',
        name: name,
        email: email,
        passwd: passwd
      })
    }
  })

  return route
}

module.exports = init
