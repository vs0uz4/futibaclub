require('dotenv').config()
const express = require('express')
const cookieParser = require("cookie-parser")
const bodyParser = require('body-parser')
const session = require('express-session')
const csrf = require('lusca').csrf
const ratelimit = require('express-rate-limit')
const mysql = require('mysql2/promise')

const middleware = require('./middleware')
const mailer = require('./utils/mailer')
const admin = require('./admin')
const account = require('./account')
const groups = require('./groups')
const ranking = require('./ranking')

// Get Enviroment Variables
const enviroment = process.env.NODE_ENV
const port = process.env.PORT
const appName = process.env.APP_NAME
const dbHost = process.env.DB_HOST
const dbPort = process.env.DB_PORT
const dbDatabase = process.env.DB_DATABASE
const dbUsername = process.env.DB_USERNAME
const dbPassword = process.env.DB_PASSWORD
const sessionSecret = process.env.SESSION_SECRET
const etherealUser = process.env.ETHEREAL_USER
const etherealPasswd = process.env.ETHEREAL_PASSWD

const app = express()
const limiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})
app.use(limiter)
app.use(express.static('public'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(session({
  secret: sessionSecret,
  cookie: { keys: [sessionSecret], secure: enviroment !== "development", httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  saveUninitialized: true,
  resave: true
}))
app.use(csrf())
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

    app.post('/', async (req, res) => {
      const account = {
        user: etherealUser,
        pass: etherealPasswd
      }

      const subjects = {
        1: 'Reclamações',
        2: 'Sugestões',
        3: 'Informações',
        4: 'Outros'
      }

      const mailerOptions = {
        name: req.body.name,
        email: req.body.email,
        subject: subjects[req.body.subject],
        message: req.body.message
      }

      const reply = await mailer(account, mailerOptions)

      res.render('home', reply)
    })

    app.use(account(connection))
    app.use('/groups', groups(connection))
    app.use('/ranking', ranking(connection))
    app.use('/admin', admin(connection))

    app.listen(port, '0.0.0.0', error => {
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
