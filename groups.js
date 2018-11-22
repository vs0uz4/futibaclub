const express = require('express')
const route = express.Router()

const init = connection => {
  route.get('/', async (req, res) => {
    const [rows, fields] = await connection.execute('SELECT groups.*, groups_users.role FROM groups LEFT JOIN groups_users ON groups.id = groups_users.group_id AND groups_users.user_id = ?', [
      req.session.user.id
    ])
    res.render('groups', {
      groups: rows
    })
  })

  route.post('/', async (req, res) => {
    const [resultSetHeader, resultSet] = await connection.execute('INSERT INTO groups (name) VALUES (?)', [
      req.body.name
    ])
    await connection.execute('INSERT INTO groups_users (group_id, user_id, role) VALUES (?, ?, ?)', [
      resultSetHeader.insertId,
      req.session.user.id,
      'owner'
    ])

    res.redirect('/groups')
  })

  route.get('/:id', async (req, res) => {
    const [groupRows, groupFields] = await connection.execute('SELECT groups.*, groups_users.role FROM groups LEFT JOIN groups_users ON groups_users.group_id = groups.id AND groups_users.user_id = ? WHERE groups.id = ?', [
      req.session.user.id,
      req.params.id
    ])
    const [pendingRows, pendingFields] = await connection.execute("SELECT groups_users.*, users.name FROM groups_users INNER JOIN users ON groups_users.user_id = users.id AND groups_users.group_id = ? AND groups_users.role LIKE 'pending'", [
      req.params.id
    ])
    const [gameRows, gameFields] = await connection.execute('SELECT games.*, guessings.result_a as guess_a, guessings.result_b as guess_b, guessings.score FROM games LEFT JOIN guessings ON games.id = guessings.game_id AND guessings.user_id = ? AND guessings.group_id = ?', [
      req.session.user.id,
      req.params.id
    ])

    res.render('group', {
      pendings: pendingRows,
      group: groupRows[0],
      games: gameRows
    })
  })

  route.post('/:id', async (req, res) => {
    const guessings = []
    Object
      .keys(req.body)
      .forEach(game => {
        const parts = game.split('_')
        const guess = {
          game_id: parts[1],
          result_a: req.body[game].team_a,
          result_b: req.body[game].team_b
        }
        guessings.push(guess)
      })

    const batch = guessings.map(guess => {
      return connection.execute('INSERT INTO guessings (result_a, result_b, game_id, group_id, user_id) VALUES (?, ?, ?, ?, ?)', [
        guess.result_a,
        guess.result_b,
        guess.game_id,
        req.params.id,
        req.session.user.id
      ])
    })
    await Promise.all(batch)

    res.redirect('/groups/' + req.params.id)
  })

  route.get('/:id/participate', async (req, res) => {
    const [rows, fields] = await connection.execute('SELECT * FROM groups_users WHERE user_id = ? AND group_id = ?', [
      req.session.user.id,
      req.params.id
    ])

    if (rows.length === 0) {
      const [resultSetHeader, resultSet] = await connection.execute('INSERT INTO groups_users (group_id, user_id, role) VALUES (?, ?, ?)', [
        req.params.id,
        req.session.user.id,
        'pending'
      ])
    }

    res.redirect('/groups')
  })

  route.get('/:groupId/approval/:groupsUsersId/:op', async (req, res) => {
    const [rows, fields] = await connection.execute('SELECT groups.*, groups_users.role FROM groups LEFT JOIN groups_users ON groups_users.group_id = groups.id AND groups_users.user_id = ? WHERE groups.id = ?', [
      req.session.user.id,
      req.params.groupId
    ])

    if (rows.length === 0 || rows[0].role !== 'owner') {
      res.redirect('/groups/' + req.params.groupId)
    } else {
      if (req.params.op === 'yes') {
        await connection.execute('UPDATE groups_users SET role = "user" WHERE id = ?', [
          req.params.groupsUsersId
        ])
      } else {
        await connection.execute('DELETE FROM groups_users WHERE id = ?', [
          req.params.groupsUsersId
        ])
      }

      res.redirect('/groups/' + req.params.groupId)
    }
  })

  route.get('/delete/:id', async (req, res) => {
    const [rows, fields] = await connection.execute('SELECT groups.*, groups_users.role FROM groups LEFT JOIN groups_users ON groups_users.group_id = groups.id AND groups_users.user_id = ? WHERE groups.id = ?', [
      req.session.user.id,
      req.params.id
    ])

    if (rows.length > 0 || rows[0].role === 'owner') {
      await connection.execute('DELETE FROM groups WHERE id = ?', [
        req.params.id
      ])
    }

    res.redirect('/groups')
  })

  return route
}

module.exports = init
