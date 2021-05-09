const express = require("express")
const Message = require('../models/message')
const Room = require('../models/room')
const connect = require('../middleware/dbconnect')
const router = express.Router()

const io = require("socket.io")()

router.get("/", async(req, res, next) => {
    let message_data = await Message.find().populate('userId').exec()
        // socket.join(req.user._json.name)
    res.render('index', { message_data: message_data, user: req.user })
})




module.exports = router