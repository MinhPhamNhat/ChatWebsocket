const moment = require('moment')

function formatMessage(userId, roomId, text) {
    return {
        userId,
        roomId,
        text,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
    }
}

module.exports = formatMessage