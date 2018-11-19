require('dotenv').config()
const express = require('express')
const session = require('express-session')
const mysql = require('mysql2/promise')
const bodyParser = require('body-parser')

const account = require('./account')

// Get Enviroment Variables
const port = process.env.APP_PORT || 3000
const appName = process.env.APP_NAME || 'FutibaClub'
const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = process.env.DB_PORT || 3306
const dbDatabase = process.env.DB_DATABASE || 'futibaclub'
const dbUsername = process.env.DB_USERNAME || 'root'
const dbPassword = process.env.DB_PASSWORD || 'secret'
const sessionSecret = process.env.SESSION_SECRET || 'secret'

const app = express()
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(session({
  secret: sessionSecret,
  saveUninitialized: true,
  resave: true
}))
app.set('view engine', 'ejs')

const init = async () => {
  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUsername,
      password: dbPassword,
      database: dbDatabase
    })

    app.use((req, res, next) => {
      if (req.session.user) {
        res.locals.user = req.session.user
      }
      next()
    })

    app.get('/', async (req, res) => {
      res.render('home')
    })

    app.use(account(connection))

    app.listen(port, error => {
      if (error) {
        console.log(`Error in Startup ${appName} Server\nError: ${error.code}\nMessage ${error.message}`)
      } else {
        console.log(`${appName} Server Running...`)
      }
    })
  } catch (error) {
    console.log(`Error occurred in Initialize App\nError: ${error.code}\nMessage:${error.message}`)
  }
}

init()
