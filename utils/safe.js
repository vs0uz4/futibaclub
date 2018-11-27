'use strict'

const Crypto = require('crypto')
const algorithm = 'aes-256-gcm'

class Safe {
  constructor (key, iv) {
    this.key = key
    this.iv = iv
  }

  encryptAsync (data) {
    return new Promise((resolve, reject) => {
      try {
        const cipher = Crypto.createCipheriv(algorithm, this.key, this.iv)
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
        encrypted += cipher.final('hex')
        const tag = cipher.getAuthTag()

        resolve(JSON.stringify({
          content: encrypted,
          tag: tag
        }))
      } catch (exception) {
        reject(exception)
      }
    })
  }

  encrypt (data) {
    try {
      const cipher = Crypto.createCipheriv(algorithm, this.key, this.iv)
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
      encrypted += cipher.final('hex')
      const tag = cipher.getAuthTag()

      return JSON.stringify({
        content: encrypted,
        tag: tag
      })
    } catch (exception) {
      throw new Error(exception.message)
    }
  }

  decryptAsync (encrypted) {
    return new Promise((resolve, reject) => {
      try {
        const data = JSON.parse(encrypted)
        data.tag = Buffer.from(data.tag)

        const decipher = Crypto.createDecipheriv(algorithm, this.key, this.iv)
        decipher.setAuthTag(data.tag)
        let decrypted = decipher.update(data.content, 'hex', 'utf8')
        decrypted += decipher.final('utf8')

        resolve(JSON.parse(decrypted))
      } catch (exception) {
        reject(exception)
      }
    })
  }

  decrypt (encrypted) {
    try {
      const data = JSON.parse(encrypted)
      data.tag = Buffer.from(data.tag)

      const decipher = Crypto.createDecipheriv(algorithm, this.key, this.iv)
      decipher.setAuthTag(data.tag)
      let decrypted = decipher.update(data.content, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      return JSON.parse(decrypted)
    } catch (exception) {
      throw new Error(exception.message)
    }
  }
}

module.exports = Safe
