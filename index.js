require('dotenv').config()
const express = require('express')
const session = require('express-session')
const mysql = require('mysql2/promise')
const bodyParser = require('body-parser')

const middleware = require('./middleware')
const admin = require('./admin')
const account = require('./account')
const groups = require('./groups')
const ranking = require('./ranking')

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
app.use(middleware)
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

    app.get('/', async (req, res) => {
      res.render('home')
    })

    app.use(account(connection))
    app.use('/groups', groups(connection))
    app.use('/ranking', ranking(connection))
    app.use('/admin', admin(connection))

    app.listen(port, error => {
      if (error) {
        console.log(`Error in Startup ${appName} Server\nError Message ${error.message}`)
      } else {
        console.log(`${appName} Server Running...`)
      }
    })
  } catch (error) {
    console.log(`Error occurred in Initialize App\nError Message: ${error.message}`)
  }
}

init()
