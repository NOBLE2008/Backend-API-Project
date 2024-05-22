const crypto = require("crypto")
const mongoose = require("mongoose");
const validator = require('validator')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        min: [2, 'A name cannot be less than two characters'],
        required: [true, 'Your name is required']
    },
    email: {
        type: String,
        validate: [validator.isEmail, "Invalid email"],
        required: [true, 'Your Email is required'],
        unique: true
    },
    photo: {
        type: String,
        default: 'defaultphoto.png'
    },
    password: {
        type: String,
        required: [true, 'Provide a password'],
        select: false
    },
    confirmPassword: {
        type: String,
        validate: {
            validator: function(v){
                return v === this.password
            },
            message: 'Password and Confirm Password must be the same'
        },
        required: [true, 'Confirm password field is required'],
        select: false
    },
    role: {
        type: String,
        enum: {
            values: ['Customer', 'Admin'],
            message: 'User can either have a role of Customer or Admin'
        },
        default: 'Customer'
    },
    permissions: {
        type: Array,
        default: []
    },
    passwordChangedAt: {
        type: Date,
        default: Date.now()
    },
    passwordResetToken: {
        type: String,
        default: '',
    },
    passwordResetExpires: {
        type: Date,
        default: undefined
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next()
    
    this.password = await bcrypt.hash(this.password, 12)
    this.confirmPassword = undefined;
    next()
})

userSchema.pre(/^find/, function(next){
    this.find({ active: {$ne: false} })
    next()
})

userSchema.methods.correctPassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.generatePasswordResetToken = async function(){
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000
    await this.save({validateBeforeSave: false})
    return resetToken
}
userSchema.methods.passwordChangedAfter = function(JWTTimestamp){
        const changedTimestamp = this.passwordChangedAt.getTime() / 1000
        return JWTTimestamp < changedTimestamp
}


// eslint-disable-next-line no-unused-vars
userSchema.methods.generateToken = async function(id){
    const token = jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
    return token
}

module.exports = mongoose.model('Users', userSchema)