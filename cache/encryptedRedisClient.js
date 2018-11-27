'use strict'

class EncryptedRedisClient {
  constructor (redisClient, safe) {
    this.redisClient = redisClient
    this.safe = safe
  }

  get (key, cb) {
    this.redisClient.get(key, (err, reply) => {
      if (err) {
        cb(err)
      }

      cb(null, this.safe.decrypt(reply))
    })
  }

  set (key, value, cb) {
    const encValue = this.safe.encrypt(value)
    this.redisClient.set(key, encValue, cb)
  }
}

module.exports = EncryptedRedisClient
