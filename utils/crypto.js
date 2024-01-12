'use strict'

const bcrypt = require("bcrypt")

const saltRounds = process.env.SALT_ROUNDS || 10
const salt = bcrypt.genSaltSync(saltRounds)

const crypto = (password) => {
  return bcrypt.hashSync(password, salt);
}

module.exports = crypto
