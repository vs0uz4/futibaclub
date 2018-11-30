'use strict'

const nodemailer = require('nodemailer')

const init = async (account, options) => {
  if (account && options) {
    let transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: account.user, // generated ethereal user
        pass: account.pass // generated ethereal password
      }
    })

    // setup email data with unicode symbols
    let mailOptions = {
      from: `"${options.name}" <${options.email}>`, // sender address
      to: 'futibaclub@example.com', // list of receivers
      subject: `FutibaClub SAC - ${options.subject}`, // Subject line
      text: `Olá Futibaclub\n${options.message}`, // plain text body
      html: `<h3><b>Olá Futibaclub!</b></h3><p>${options.message}</p>` // html body
    }

    // send mail with defined transport object
    const transporterMailed = await transporter.sendMail(mailOptions)

    const reply = {
      error: null,
      messageId: transporterMailed.messageId,
      previewUrl: nodemailer.getTestMessageUrl(transporterMailed)
    }

    return reply
  } else {
    const err = 'Mailer : Parametros {account} e {options} para criação de mailer indefinidos'

    const reply = {
      error: err,
      messageId: null,
      previewUrl: null
    }

    return reply
  }
}

module.exports = init
