const mongoose = require('mongoose')
const Schema = mongoose.Schema


const messageSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    fromUser: {
        type: String,
        ref: 'User'
    },
    toUser: {
        type: String,
        ref: 'User'
    },
    message: String,
    time: String
})

module.exports = mongoose.model('Message', messageSchema)