const express = require('express')
const route = express.Router()
const encRedisClient = require('./cache/setup')

const init = connection => {
  let classification = null

  route.get('/', async (req, res) => {
    await encRedisClient.getAsync('invalidatedCache', async (err, reply) => {
      if (err) {
        console.log(err.message)
      }

      if (reply) {
        classification = null
      }
    })

    if (!classification) {
      const groupsRanking = await encRedisClient.getAsync('groupsRanking', async (err, reply) => {
        if (err) {
          console.log(err.message)
        } else {
          if (reply.length > 0) {
            return reply
          } else {
            const [groups] = await connection.execute('SELECT groups.id, groups.name, SUM(guessings.score) as score FROM groups LEFT JOIN guessings ON guessings.group_id = groups.id GROUP BY groups.id ORDER BY score DESC')

            await encRedisClient.setexAsync('groupsRanking', 84600, groups, (err) => {
              if (err) {
                console.log(err.message)
              }
            })

            return groups
          }
        }
      })

      const usersRanking = await encRedisClient.getAsync('usersRanking', async (err, reply) => {
        if (err) {
          console.log(err.message)
        } else {
          if (reply.length > 0) {
            return reply
          } else {
            const [users] = await connection.execute('SELECT users.id, users.name, SUM(guessings.score) as score FROM users LEFT JOIN guessings on guessings.user_id = users.id GROUP BY users.id ORDER BY score DESC')

            await encRedisClient.setexAsync('usersRanking', 84600, users, (err) => {
              if (err) {
                console.log(err.message)
              }
            })

            return users
          }
        }
      })

      await encRedisClient.setAsync('invalidatedCache', false, (err) => {
        if (err) {
          console.log(err.message)
        }
      })

      classification = {
        groupsRanking,
        usersRanking
      }
    }

    res.render('ranking', classification)
  })

  return route
}

module.exports = init
