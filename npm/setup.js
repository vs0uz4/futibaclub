'use strict'

const redis = require('redis')
const config = require('./config')
const Safe = require('../utils/safe')
const EncryptedRedisClient = require('./encryptedRedisClient')
let key = process.env.ENCRYPTED_KEY
let iv = process.env.ENCRYPTED_IV

const client = redis.createClient(config)

client.on('connect', () => {
  console.log('Redis Client Connected!')
})

client.on('error', (err) => {
  console.log('Something went wrong ' + err)
})

const encClient = new EncryptedRedisClient(client, new Safe(this.key, this.iv))

module.exports = encClient
