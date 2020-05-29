const service = require('./service')

function getUsers() {
  service.getUsers()
}

module.exports = {
  getUsers
}