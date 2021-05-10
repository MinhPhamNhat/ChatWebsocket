const Message = require('./models/message')
const User = require('./models/user')
const mongoose = require('mongoose')

const io = require("socket.io")()
var users = []
const socketIO = {
        io: io,
    }

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
        // Nếu người dùng đã có trong list thì không thêm vào nữa
        var checkUser = users.findIndex(u=> u.userId === userId)
        if (checkUser !== -1)
        users.splice(checkUser, 1)
        users.push(newUser)

        // Event user là người dùng tác động đến list. Ví dụ join hoặc disconnect
        io.emit("list-user", { users, eventUser: {...newUser, action: true } })
    })

    // Bắt sự kiện tìm kiếm người dùng
    socket.on('searching', async(data) => {
        if (data.text) {
            // Tìm người dùng có tên match với text
            var searchUser = await User.find({ name: { "$regex": data.text, "$options": "i" } }).exec()

            // Map người dùng để hiện danh sách trên browser
            searchUser = searchUser.map(u => {
                // Nếu cóc người dùng trong danh sách tức là người dùng đang active thì trả về người dùng đó
                for (i in users) {
                    if (users[i].userId == u._id) {
                        return users[i]
                    }
                }
                // Không thì trả về người dùng mới không active
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

    // Bắt sự kiện người dùng nhấn vào người dùng khác để chat
    socket.on("get-into-chat", async(data) => {
        // Lấy thông tin người dùng được nhấn vào
        var chatfromUser = data.fromUser
        var chatToUser = data.toUser
        var user = await User.findById(chatToUser).exec()
        var isActive = users.findIndex(u => u.userId == chatToUser)!==-1
        // Lấy tin nhắn giữa hai người dùng
        var messages = await Message
                .find({
                    $or:[{
                            fromUser: chatfromUser, 
                            toUser: chatToUser
                        }, 
                        {
                            fromUser: chatToUser, 
                            toUser: chatfromUser 
                        }]
                })
                .sort({time: 1})
                .populate("fromUser toUser").exec()
        socket.emit("get-into-chat", { user: {...user._doc, active:isActive}, messages})
    })
    // Kết thúc bắt sự kiện người dùng nhấn vào người dùng khác để chat


    // Bắt sự kiện đang gõ
    socket.on("typing", (data) => {
        var userIdx = users.findIndex(u => u.userId == data.userChatId)
        if (userIdx!==-1)
        io.to(users[userIdx].id).emit("typing", data)
    })

    socket.on("typing-done", (data) => {
        var userIdx = users.findIndex(u => u.userId == data.userChatId)
        if (userIdx!==-1)
        io.to(users[userIdx].id).emit("typing-done", data)
    })
    // Kết thúc bắt sự kiện đang gõ

    // Bắt sự kiện người dùng gửi tin nhắn
    socket.on("send-message", async (data)=>{
        var time = new Date()
        // Tạo tin nhắn mới
        new Message({
            _id: new mongoose.Types.ObjectId(),
            fromUser: data.from,
            toUser: data.to,
            message: data.message,
            time
        }).save()

        var toUser = users.findIndex(u => u.userId == data.to)
        var fromUser = users.findIndex(u => u.userId == data.from)
        
        // Nếu người dùng không có trong danh sách online thì tạo một người dùng khác để trả về
        if(toUser === -1){
            var user = await User.findById(data.to).exec()
            data.toUser= {
                name: user.name,
                userId: user._id,
                picture: user.picture
            } 
        }else{
            data.toUser = users[toUser]
        }
        data.fromUser = users[fromUser]
        data.time = time

        // Emit cho cá nhân
        socket.emit("send-message", (data))

        // Nếu người dùng không có trong danh sách online thì không emit cho người đó
        if(toUser !== -1){
            var socketId = users[toUser].id
            io.to(socketId).emit("send-message", (data))
        }
    })

    socket.on("disconnect", () => {
        var index = users.findIndex(u => u.id == socket.id)
        var user = users[index]
        users.splice(index, 1)
        io.emit("list-user", { users, eventUser: {...user, action: false } })
    })
})


module.exports = socketIO