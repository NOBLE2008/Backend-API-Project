const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');
const AppError = require('./appError');
// create reusable transportnpmer object using the default SMTP transport
module.exports = class Email{
    constructor(recipient, subject, text, html, response) {
        this.recipient = recipient
        this.subject = subject
        this.text = text
        this.html = html
        this.response = response
    }

    sendEmail(res, next){
        const transport =  nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: process.env.SENDGRID_USER,
                pass: process.env.SENDGRID_PASSWORD,
            },
        });
        const mailOptions = {
            from: 'nobleben2008@gmail.com', // sender address
            to: this.recipient, // list of receivers
            subject: this.subject, // Subject line
            text: this.text, // plain text body
            html: this.html, // html body
          };
        transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return next(new AppError('Something Went wrong.', 500));
      }
      if (info) {
        return res.status(200).json({
          status: 'success',
          message: 'Email sent successfully',
        });
      }
      transport.close(); // shut down the connection pool, no more messages
      // shut down the connection pool, no more messages
    });
    }

}
