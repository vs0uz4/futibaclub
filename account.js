const express = require('express')
const route = express.Router()
const crypto = require('./utils/crypto')

const init = connection => {
  route.get('/sign-in', (req, res) => {
    res.render('account/sign-in')
  })

  route.post('/sign-in', async (req, res) => {
    const {
      email,
      passwd
    } = req.body

    const [rows, fields] = await connection.execute('SELECT users.id, users.name, users.email, users.passwd, users.`role` FROM `users` WHERE users.email = ?', [email])
    if (rows.length !== 0 && rows[0].passwd === crypto(passwd)) {
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

    const [rows, fields] = await connection.execute('SELECT users.id, users.name, users.email, users.passwd, users.`role` FROM `users` WHERE users.email = ?', [email])
    if (rows.length === 0) {
      const [resultSetHeader, resultSet] = await connection.execute('INSERT INTO `users` (users.name, users.email, users.passwd, users.role) VALUES (?, ?, ?, ?)', [
        name,
        email,
        crypto(passwd),
        'user'
      ])

      const user = {
        id: resultSetHeader.insertId,
        name: name,
        role: 'user'
      }
      req.session.user = user

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

  route.get('/profile', async (req, res) => {
    if (req.session.user) {
      const userId = req.session.user.id
      const [rows, fields] = await connection.execute('SELECT users.id, users.name, users.email FROM `users` WHERE id = ?', [userId])

      if (rows.length > 0) {
        res.render('account/profile', {
          id: rows[0].id,
          name: rows[0].name,
          email: rows[0].email
        })
      } else {
        req.session.destroy(err => {
          if (err) {
            console.log(`Error Destroying Session\nError: ${err.code}\nMessage ${err.message}`)
          }

          res.redirect('/sign-in')
        })
      }
    } else {
      res.redirect('/sign-in')
    }
  })

  route.post('/profile/:id', async (req, res) => {
    const [rows, fields] = await connection.execute('SELECT users.id, users.name, users.email, users.passwd, users.`role` FROM `users` WHERE id = ? LIMIT 1', [req.params.id])

    const {
      name,
      email,
      passwd
    } = req.body

    if (rows.length > 0) {
      await connection.execute('UPDATE `users` SET users.name = ?, users.email = ?, users.passwd = ? WHERE users.id = ?', [
        name,
        email,
        crypto(passwd),
        req.params.id
      ])

      const user = {
        id: rows[0].id,
        name: name,
        role: rows[0].role
      }
      req.session.user = user

      res.redirect('/')
    } else {
      res.redirect('/sign-in')
    }
  })

  return route
}

module.exports = init
