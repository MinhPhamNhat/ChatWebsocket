const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    _id: String,
    name: String,
    email: String,
    avatar: String
})

module.exports = mongoose.model('User', userSchema)