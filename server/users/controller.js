const service = require('./service')

function getUsers() {
  return service.getUsers()
}

async function create(req) {
  let username = req.payload.username
  let password = req.payload.password
  return await service.create(username, password)
}

module.exports = {
  getUsers,
  create
}