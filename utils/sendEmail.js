const nodemailer = require('nodemailer')
// eslint-disable-next-line import/no-extraneous-dependencies
const {google} = require('googleapis')
const catchAsync = require('./catchAsync')
const AppError = require('./appError')

const {OAuth2} = google.auth

const Oauth2_Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
)

Oauth2_Client.setCredentials({
    refresh_token: process.env.REFRESH
})

// create reusable transportnpmer object using the default SMTP transport
exports.sendEmail = (recipient, subject, text, html, response) => async (req, res, next) => {

    // eslint-disable-next-line camelcase
    const accessToken = Oauth2_Client.getAccessToken((err, token) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'nobleben2008@gmail.com',
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: token,
            },
            tls: {
                rejectUnauthorized: false // Allow self-signed certificates
            }
        })
        
        // send mail with defined transport object
        
        const mailOptions = {
            from: 'Noble Web Solutions', // sender address
            to: recipient, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html // html body
        }
        transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return next(new AppError(error.message, 500))
        }
        transporter.close() // shut down the connection pool, no more messages
        // shut down the connection pool, no more messages
    })
    })
        
    }