let routes = []

const root = 'users'
const controller = require('./controller')

routes.push({
  method: 'GET',
  path: `/${root}`,
  handler: controller.getUsers
})

routes.push({
  method: 'POST',
  path: `/${root}`,
  handler: controller.create,
})


module.exports = routes