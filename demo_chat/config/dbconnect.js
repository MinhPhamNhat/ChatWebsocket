const mongoose = require('mongoose')

const connect = mongoose.connect(process.env.MONGODB_CONFIG, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})