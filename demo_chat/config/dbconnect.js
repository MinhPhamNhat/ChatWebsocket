const mongoose = require('mongoose')

require('dotenv').config()

mongoose.connect("mongodb+srv://admin:demochatsocket@demochatsocket.mxecd.mongodb.net/myChat?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

// mongoose.connect("mongodb+srv://admin:demochatsocket@demochatsocket.mxecd.mongodb.net/myChat?retryWrites=true&w=majority", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })