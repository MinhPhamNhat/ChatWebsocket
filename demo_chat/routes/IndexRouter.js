const express = require("express")
const Message = require('../models/message')
const connect = require('../middleware/dbconnect')
const router = express.Router()

const io = require("socket.io")()

router.get("/", async(req, res, next) => {
    let message_data = await Message.find()

    // socket.join(req.user._json.name)
    res.render('index', { message_data: message_data, name: req.user._json.name, avatar: req.user._json.picture })
})




module.exports = router