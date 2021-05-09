const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    _id: String,
    name: {
        type: String,
        require: true
    },
    picture: {
        type: String
    },
    roomId: {
        type: String,
        ref: 'Room'
    }
})

module.exports = mongoose.model('User', userSchema)