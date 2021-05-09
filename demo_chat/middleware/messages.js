const moment = require('moment')

function formatMessage(userId, userRoom, username, text) {
    return {
        userId,
        userRoom,
        username,
        text,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
    }
}

module.exports = formatMessage