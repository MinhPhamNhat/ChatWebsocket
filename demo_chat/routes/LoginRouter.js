const express = require("express")
const passport = require("passport")
const router = express.Router()

router.get("/", (req, res, next) => {
    res.render('login')
})
router.get('/account', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/account/callback', passport.authenticate('google', { successReturnToOrRedirect: '/', failureRedirect: '/login' }), async(req, res) => {

})

module.exports = router