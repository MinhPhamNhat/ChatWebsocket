const mongoose = require('mongoose')
const Schema = mongoose.Schema


const roomSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        require: true
    },
    userId_1: String,
    userId_2: String
})

module.exports = mongoose.model('Room', roomSchema)