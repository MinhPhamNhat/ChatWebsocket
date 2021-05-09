const mongoose = require('mongoose')
const Schema = mongoose.Schema


const messageSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: {
        type: String,
        ref: 'User'
    },
    roomId: {
        type: String,
        ref: 'Room'
    },
    content: String,
    time: String
})

module.exports = mongoose.model('Message', messageSchema)