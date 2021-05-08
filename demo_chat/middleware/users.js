const users = [];

function userJion(id, name, room) {
    const user = { id, name, room }
    users.push(user)

    return user
}

function getCurrentUser(id) {
    return users.find(user => user.id === id)
}

module.exports = { userJion, getCurrentUser }