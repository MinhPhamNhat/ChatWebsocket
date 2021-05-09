const formatMessage = require("./middleware/messages");
const Message = require('./models/message')
const connect = require('./middleware/dbconnect')
const User = require('./models/user')
var { userJion, getCurrentUser } = require("./middleware/users")

const io = require("socket.io")()
var numberOfUserOnline = 0
var users = []
var messages = []
const socketIO = {
    io: io,
    // join: (name) => {
    //     console.log(users)
    //     users.push({id, name, time: new Date()})
    //     io.emit("list-user" ,{users, eventUser: {id, name, action: true}})
    // }
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
        io.emit("list-user", { users, eventUser: { ...newUser, action: true } })
        // const user = userJion(id, username, room)

        // socket.join(user.room)

        // socket.emit('message', formatMessage(botName, 'Demo Chat'))

        // socket.broadcast.emit('message', formatMessage(botName, 'A People has joined the chat'))
    })

    socket.on('typing', async (data) => {
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
            
            searchUser.sort((u1, u2) => {
                return (u1.active === u2.active)? 0 : u1? -1 : 1
            })

            socket.emit("list-user", { users: searchUser })
        }else{
            io.emit("list-user", { users })
        }
    })

    // Listen for chatMessage
    socket.on('chatMessage', ({ msg, userId }) => {
        var index = users.findIndex(u => u.id == userId)
        var picture = users.findIndex(u => u.picture == picture)
        var name = users.findIndex(u => u.name == name)
        var roomId = socket.id
        formatMessages = formatMessage(socket.id, roomId, name, msg)
        io.emit('message', formatMessages)
        connect.then(db => {
            let message_data = new Message({ userId: socket.id, roomId: roomId, username: name, content: msg, picture: picture, time: formatMessages.time })
            message_data.save()
        })
    })

    socket.on("get-user-info", async (userId) =>{
        var user = await User.findById(userId).exec()
        socket.emit("get-user-info", {user})
    })

    socket.on("disconnect", () => {
        var index = users.findIndex(u => u.id == socket.id)
        var user = users[index]
        users.splice(index, 1)
        io.emit("list-user", { users, eventUser: {...user, action: false } })
    })
})


module.exports = socketIO