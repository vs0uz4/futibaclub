'use strict'

const redis = require('redis')
const config = require('./config')
const Safe = require('../utils/safe')
const EncryptedRedisClient = require('./encryptedRedisClient')

const client = redis.createClient(config)

client.on('connect', () => {
  console.log('Redis Client Connected!')
})

client.on('error', (err) => {
  console.log('Something went wrong ' + err)
})

const encClient = new EncryptedRedisClient(client, new Safe('3zTvzr3p67VC61jmV54rIYu1545x4TlY', '60iP0h6vJoEa'))

module.exports = encClient
