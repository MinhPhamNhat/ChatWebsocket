const express = require("express")
const router = express.Router()
const io = require("socket.io")()

router.get("/", (req, res, next) => {
    // socket.join(req.user._json.name)
    res.render('index', { name: req.user._json.name })
})


io.on('connection', socket => {
    socket.on('chat message', msg => {
        io.emit('chat message', msg);
    });
})



module.exports = router