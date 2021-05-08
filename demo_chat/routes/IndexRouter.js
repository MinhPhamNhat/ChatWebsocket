const express = require("express")
const router = express.Router()
const io = require("socket.io")()

router.get("/", (req, res, next) => {
    // socket.join(req.user._json.name)
    res.render('index', { name: req.user._json.name, avatar: req.user._json.picture })
})




module.exports = router