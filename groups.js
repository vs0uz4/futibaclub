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

  route.get('/:id', async (req, res) => {
    const [groupRows, groupFields] = await connection.execute('SELECT groups.*, groups_users.role FROM groups LEFT JOIN groups_users ON groups_users.group_id = groups.id AND groups_users.user_id = ? WHERE groups.id = ?', [
      req.session.user.id,
      req.params.id
    ])
    const [pendingRows, pendingFields] = await connection.execute("SELECT groups_users.*, users.name FROM groups_users INNER JOIN users ON groups_users.user_id = users.id AND groups_users.group_id = ? AND groups_users.role LIKE 'pending'", [
      req.params.id
    ])

    res.render('group', {
      pendings: pendingRows,
      group: groupRows[0]
    })
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

  return route
}

module.exports = init
