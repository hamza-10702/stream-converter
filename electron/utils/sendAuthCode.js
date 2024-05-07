import nodemailer from 'nodemailer';
import emailCodeTemplate from './emailCodeTemplate.js';

import dotenv from 'dotenv';


dotenv.config()


// HTML EMAIL TEMPLATE: https://github.com/leemunroe/responsive-html-email-template/blob/master/email.html

const sendAuthCode = (email, code) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: `${process.env.EMAIL_ADDRESS}`,
      pass: `${process.env.EMAIL_PASSWORD}`,
    },
  })

  const mailOptions = {
    from: 'Ohmystream <ohmystreamer@gmail.com>',
    to: email,
    subject: 'Ohmystream 6 digit code',
    // text: `Your code is ${code}.`,
    html: emailCodeTemplate(code),
  }

  return transporter.sendMail(mailOptions, (err, response) => {
    if (err) {
      console.error('there was an error: ', err)
    } else {
      console.log('success')
    }
  })
}

export default sendAuthCode
