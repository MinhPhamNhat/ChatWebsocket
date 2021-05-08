const mongoose = require('mongoose')
const Schema = mongoose.Schema


const messageSchema = new Schema({
    username: {
        type: String
    },
    content: String,
    time: String
})

module.exports = mongoose.model('Message', messageSchema)