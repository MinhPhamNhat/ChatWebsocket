const passport = require('passport')
const GooglePassport = require('passport-google-oauth20').Strategy
const account = require('../repository/account')
const mongoose = require('mongoose');


const User = mongoose.model('User');

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
    if (profile.id) {
        User.findOne({ googleId: profile.id })
            .then((existingUser) => {
                if (existingUser) {
                    done(null, existingUser);
                } else {
                    new User({
                            email: profile.emails[0].value,
                            name: profile.name.familyName + ' ' + profile.name.givenName,
                            avatar: profile.avatar,
                        })
                        .save()
                        .then(user => done(null, user));
                }
            })
    }
}))