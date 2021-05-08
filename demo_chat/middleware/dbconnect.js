const mongoose = require('mongoose')
require("dotenv").config()
const connect = mongoose.connect(process.env.MONGODB_CONFIG, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

module.exports = connect