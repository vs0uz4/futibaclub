require('dotenv').config()
const express = require('express')

// Get Enviroment Variables
const port = process.env.APP_PORT || 3000
const appName = process.env.APP_NAME || 'FutibaClub'

const app = express()
app.use(express.static('public'))
app.set('view engine', 'ejs')

const init = async () => {
  try {
    app.get('/', (req, res) => {
      res.render('home')
    })

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
