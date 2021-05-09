const passport = require('passport')
const GooglePassport = require('passport-google-oauth20').Strategy
const User = require('../models/user')

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})


passport.use('google', new GooglePassport({
    clientID: '1003423118803-ukvb5i00ssnjq9uckdrch5oesj3d65tl.apps.googleusercontent.com',
    clientSecret: 'A2pHPaD4iUY3zMZnFQYUVvMK',
    callbackURL: 'http://localhost:8080/login/account/callback',
}, async(accessToken, refreshToken, profile, done) => {
    var { sub, name, picture } = profile._json
    await User.findOne({ _id: sub })
        .then(user => {
            if (user) {
                done(null, user)
            } else {
                new User({
                    _id: sub,
                    name,
                    picture
                }).save().then(newUser => {
                    done(null, newUser)
                })
            }
        }).catch(err => {
            done(null, false, { message: "Failed to login" })
        })
}))