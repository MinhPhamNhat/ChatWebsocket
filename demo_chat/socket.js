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

    socket.on("get-into-chat", async(data) => {
        var chatfromUser = data.fromUser
        var chatToUser = data.toUser
        var user = await User.findById(chatToUser).exec()
        var isActive = users.findIndex(u => u.chatToUser == chatToUser)!==-1

        var messages = await Message.find({fromUser: chatfromUser, toUser: chatToUser}).populate("fromUser toUser").exec()
        socket.emit("get-into-chat", { user: {...user._doc, active:isActive}, messages})
    })

    socket.on("typing", (data) => {
        socket.broadcast.emit("typing", data)
    })

    socket.on("typing-done", (data) => {
        socket.broadcast.emit("typing-done", data)
    })

    socket.on("send-message", async (data)=>{
        var time = new Date()
        new Message({
            _id: new mongoose.Types.ObjectId(),
            fromUser: data.from,
            toUser: data.to,
            message: data.message,
            time
        }).save()

        var toUser = users.findIndex(u => u.userId == data.to)
        var fromUser = users.findIndex(u => u.userId == data.from)

        var socketId = users[toUser].id
        
        data.fromUser = users[fromUser]
        data.toUser = users[toUser]
        data.time = time

        socket.emit("send-message", (data))
        io.to(socketId).emit("send-message", (data))
    })

    socket.on("disconnect", () => {
        var index = users.findIndex(u => u.id == socket.id)
        var user = users[index]
        users.splice(index, 1)
        io.emit("list-user", { users, eventUser: {...user, action: false } })
    })
})


module.exports = socketIO