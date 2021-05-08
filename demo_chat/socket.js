const io = require("socket.io")()
var numberOfUserOnline = 0
var users = []
var id;
const socketIO = {
    io: io,
    // join: (name) => {
    //     console.log(users)
    //     users.push({id, name, time: new Date()})
    //     io.emit("list-user" ,{users, eventUser: {id, name, action: true}})
    // }
}

io.on('connection', socket => {
    socket.on("user-join", (name) => {
        id = socket.id
        users.push({ id, name, time: new Date() })
        io.emit("list-user", { users, eventUser: { id, name, action: true } })
    })

    socket.on("disconnect", () => {
        var index = users.findIndex(u => u.id == socket.id)
        var name = users[index].name
        users.splice(index, 1)
        io.emit("list-user", { users, eventUser: { id: socket.id, name, action: false } })
    })

})


module.exports = socketIO