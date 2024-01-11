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

      if (reply) {
        cb(null, this.safe.decrypt(reply))
      } else {
        cb(null, [])
      }
    })
  }

  getAsync (key, cb) {
    return new Promise((resolve, reject) => {
      try {
        this.redisClient.get(key, (err, reply) => {
          if (err) {
            reject(cb(err))
          }

          if (reply) {
            resolve(cb(null, this.safe.decrypt(reply)))
          } else {
            resolve(cb(null, []))
          }
        })
      } catch (exception) {
        reject(exception)
      }
    })
  }

  set (key, value, cb) {
    const encValue = this.safe.encrypt(value)
    this.redisClient.set(key, encValue, cb)
  }

  setAsync (key, value, cb) {
    return new Promise((resolve, reject) => {
      try {
        const encValue = this.safe.encrypt(value)
        const reply = this.redisClient.set(key, encValue, cb)

        resolve(reply)
      } catch (exception) {
        reject(exception)
      }
    })
  }

  setex (key, seconds, value, cb) {
    const encValue = this.safe.encrypt(value)
    this.redisClient.setex(key, seconds, encValue, cb)
  }

  setexAsync (key, seconds, value, cb) {
    return new Promise((resolve, reject) => {
      try {
        const encValue = this.safe.encrypt(value)
        const reply = this.redisClient.setex(key, seconds, encValue, cb)

        resolve(reply)
      } catch (exception) {
        reject(exception)
      }
    })
  }
}

module.exports = EncryptedRedisClient
