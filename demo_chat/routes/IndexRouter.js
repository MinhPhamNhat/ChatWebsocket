const express = require("express")
const connect = require('../middleware/dbconnect')
const router = express.Router()

const io = require("socket.io")()

router.get("/", async(req, res, next) => {
    res.render('index', { user: req.user })
})




module.exports = router