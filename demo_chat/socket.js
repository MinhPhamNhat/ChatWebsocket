const formatMessage = require("./middleware/messages");
const Message = require('./models/message')
const Room = require('./models/room')
const connect = require('./middleware/dbconnect')
const User = require('./models/user')
const mongoose = require('mongoose')
var { userJion, getCurrentUser } = require("./middleware/users")

const io = require("socket.io")()
var numberOfUserOnline = 0
var users = []
var messages = []
var rooms = []
const socketIO = {
        io: io,
    }
    // const botName = 'Van Nam'
io.on('connection', socket => {
    socket.on("user-join", async(userId) => {
        // Lấy người dùng từ db
        var user = await User.findById(userId).exec()
            // Tạo user mới để lưu vào list
        var newUser = {
            id: socket.id,
            name: user.name,
            picture: user.picture,
            userId: user._id,
            active: true,
            time: new Date()
        }
        users.push(newUser)
            // Event user là người dùng mới join vào socket
        io.emit("list-user", { users, eventUser: {...newUser, action: true } })
            // const user = userJion(id, username, room)
    })

    socket.on('searching', async(data) => {
        if (data.text) {
            var searchUser = await User.find({ name: { "$regex": data.text, "$options": "i" } }).exec()
            searchUser = searchUser.map(u => {
                for (i in users) {
                    if (users[i].userId == u._id) {
                        return users[i]
                    }
                }
                return {
                    name: u.name,
                    picture: u.picture,
                    userId: u._id,
                    active: false,
                }
            })
            searchUser = await Promise.all(searchUser)

            socket.emit("list-user", { users: searchUser })
        } else {
            io.emit("list-user", { users })
        }
    })

    // Listen for chatMessage
    socket.on('chatMessage', ({ msg, userIdLogin, roomId }) => {
        formatMessages = formatMessage(userIdLogin, roomId, msg)
        io.emit('message', formatMessages)
        connect.then(db => {
            let message_data = new Message({ _id: new mongoose.Types.ObjectId(), userId: userIdLogin, roomId: roomId, content: msg, time: formatMessages.time })
            message_data.save()
        })

    })

    socket.on("get-user-info", async(userId) => {
        var user = await User.findById(userId).exec()
        socket.emit("get-user-info", { user })
    })

    socket.on('check-roomId', async(userId) => {
        var user = await User.findById(userId).exec()
        io.emit('check-roomId', { user })
    })

    socket.on('create-roomId', ({ userIdLogin, userIdClicked }) => {
        var roomName = userIdLogin + userIdClicked
        connect.then(async db => {
            id = new mongoose.Types.ObjectId()
            var room = new Room({ _id: id, name: roomName })
            room.save()

            var userLogin = await User.findById(userIdLogin).exec()
            userLogin.roomId.push(id)
            userLogin.save()

            var userClicked = await User.findById(userIdClicked).exec()
            userClicked.roomId.push(id)
            userClicked.save()
        })
    })

    socket.on("disconnect", () => {
        var index = users.findIndex(u => u.id == socket.id)
        var user = users[index]
        users.splice(index, 1)
        io.emit("list-user", { users, eventUser: {...user, action: false } })
    })
})


module.exports = socketIO