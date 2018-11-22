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

  route.post('/games/results', async (req, res) => {
    const games = []
    Object
      .keys(req.body)
      .forEach(game => {
        const parts = game.split('_')
        const results = {
          game_id: parseInt(parts[1]),
          result_a: parseInt(req.body[game].team_a),
          result_b: parseInt(req.body[game].team_b)
        }
        games.push(results)
      })

    for (let i = 0; i < games.length; i++) {
      const game = games[i]

      await connection.execute('UPDATE games SET result_a = ?, result_b = ? WHERE id = ?', [
        game.result_a,
        game.result_b,
        game.game_id
      ])

      const [guessings] = await connection.execute('SELECT * FROM guessings WHERE game_id = ?', [
        game.game_id
      ])

      const batch = guessings.map(guess => {
        let score = 0

        if (guess.result_a === game.result_a && guess.result_b === game.result_b) {
          score = 100
        } else if (guess.result_a === game.result_a || guess.result_b === game.result_b) {
          score += 25
          if (guess.result_a < guess.result_b && game.result_a < game.result_b) {
            score += 25
          } else if (guess.result_a > guess.result_b && game.result_a > game.result_b) {
            score += 25
          }
        } else if ((guess.result_a < guess.result_b && game.result_a < game.result_b) || (guess.result_a > guess.result_b && game.result_a > game.result_b)) {
          score += 25
        }

        return connection.execute('UPDATE guessings SET score = ? WHERE id = ?', [
          score,
          guess.id
        ])
      })

      await Promise.all(batch)
    }

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