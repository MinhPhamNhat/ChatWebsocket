const mongoose = require('mongoose')
const User = require('../models/user')


module.exports = {
    saveNewStudent: async(user) => {
        return User.findOne({ email: user.email })
            .exec()
            .then(async(std) => {
                if (!std) {
                    return new Account({
                            _id: mongoose.Types.ObjectId(),
                            role: { student: true }
                        }).save()
                        .then(async result => {
                            var userObj = {
                                _id: result._id,
                                name: user.name,
                                email: user.email,
                                avatar: user.picture,
                            }
                            return new User(userObj).save()
                                .then((result) => {
                                    return JSON.stringify({ code: 0, message: "new user", data: result })
                                })
                        })
                } else
                    return JSON.stringify({ code: 0, message: "already have user", data: std })
            })
    }
}