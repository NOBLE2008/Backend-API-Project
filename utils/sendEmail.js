const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');
const AppError = require('./appError');
// create reusable transportnpmer object using the default SMTP transport
exports.sendEmail =
  (recipient, subject, text, html, response) => async (req, res, next) => {
    // eslint-disable-next-line camelcase
    const transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
    // send mail with defined transport object

    const mailOptions = {
      from: 'nobleben2008@gmail.com', // sender address
      to: recipient, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
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
      transporter.close(); // shut down the connection pool, no more messages
      // shut down the connection pool, no more messages
    });
  };
