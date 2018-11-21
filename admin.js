const express = require('express')
const route = express.Router()

const init = connection => {
  route.get('/', (req, res) => {
    res.send('Olá Administrador')
  })

  route.get('/games', async (req, res) => {
    const [rows, fields] = await connection.execute('SELECT * FROM games')

    res.render('admin/games', {
      games: rows
    })
  })

  route.post('/games', async (req, res) => {
    const {
      team_a: teamA,
      team_b: teamB
    } = req.body
    await connection.execute('INSERT INTO games (team_a, team_b) VALUES (?, ?)', [
      teamA,
      teamB
    ])

    res.redirect('/admin/games')
  })

  route.get('/games/delete/:id', async (req, res) => {
    await connection.execute('DELETE FROM games WHERE id = ? LIMIT 1', [
      req.params.id
    ])

    res.redirect('/admin/games')
  })

  return route
}

module.exports = init
