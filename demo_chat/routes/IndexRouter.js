const express = require("express")
const Message = require('../models/message')
const Room = require('../models/room')
const connect = require('../middleware/dbconnect')
const router = express.Router()

const io = require("socket.io")()

router.get("/", async(req, res, next) => {
    res.render('index', { user: req.user })
})




module.exports = router