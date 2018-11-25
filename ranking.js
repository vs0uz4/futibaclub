const express = require('express')
const route = express.Router()

const init = connection => {
  route.get('/', async (req, res) => {
    const [groupsRanking] = await connection.execute('SELECT groups.id, groups.name, SUM(guessings.score) as score FROM groups LEFT JOIN guessings ON guessings.group_id = groups.id GROUP BY groups.id ORDER BY score DESC')
    const [usersRanking] = await connection.execute('SELECT users.id, users.name, SUM(guessings.score) as score FROM users LEFT JOIN guessings on guessings.user_id = users.id GROUP BY users.id ORDER BY score DESC')

    res.render('ranking', {
      groupsRanking,
      usersRanking
    })
  })

  return route
}

module.exports = init
