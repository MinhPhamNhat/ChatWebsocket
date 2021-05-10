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
    clientID: '279719051312-a6v0h7kif6sjl5e1au3gbidnoman2ifi.apps.googleusercontent.com',
    clientSecret: 'YM8h_cQsQmREMCkbP_QiGK5M',
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
            console.log(err)
            console.log("Failed to login" )
            done(null, false, { message: "Failed to login" })
        })
}))