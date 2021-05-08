const formatMessage = require("./middleware/messages");
var { userJion, getCurrentUser } = require("./middleware/users")
const io = require("socket.io")()
var numberOfUserOnline = 0
var users = []
var messages = []
var id;
const socketIO = {
    io: io,
    // join: (name) => {
    //     console.log(users)
    //     users.push({id, name, time: new Date()})
    //     io.emit("list-user" ,{users, eventUser: {id, name, action: true}})
    // }
}

var name
    // const botName = 'Van Nam'
io.on('connection', socket => {
    socket.on("user-join", (name) => {
        id = socket.id

        users.push({ id, name, time: new Date() })
        io.emit("list-user", { users, eventUser: { id, name, action: true } })

        // const user = userJion(id, username, room)

        // socket.join(user.room)

        // socket.emit('message', formatMessage(botName, 'Demo Chat'))

        // socket.broadcast.emit('message', formatMessage(botName, 'A People has joined the chat'))
    })



    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        var index = users.findIndex(u => u.id == socket.id)
        var name = users[index].name
        io.emit('message', formatMessage(name, msg))
    })


    socket.on("disconnect", () => {
        var index = users.findIndex(u => u.id == socket.id)
        var name = users[index].name
        users.splice(index, 1)
        io.emit("list-user", { users, eventUser: { id: socket.id, name, action: false } })
    })
})


module.exports = socketIO