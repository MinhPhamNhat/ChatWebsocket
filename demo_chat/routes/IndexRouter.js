const express = require("express")
const router = express.Router()

const io = require("socket.io")()

router.get("/", async(req, res, next) => {
    res.render('index', { user: req.user })
})




module.exports = router