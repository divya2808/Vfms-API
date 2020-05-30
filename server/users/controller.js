const service = require('./service')

function getUsers() {
  return service.getUsers()
}

async function create(req) {
  let username = req.payload.username
  let password = req.payload.password
  return await service.create(username, password)
}

async function authenticate(req) {
  let username = req.payload.username
  let password = req.payload.password
  return await service.authenticate(username, password)
}

module.exports = {
  getUsers,
  create,
  authenticate
}