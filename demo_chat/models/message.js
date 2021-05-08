const mongoose = require('mongoose')

const messageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    authorId: String,
    content: String,
});

module.exports = mongoose.model('Message', messageSchema)