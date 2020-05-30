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

routes.push({
  method: 'POST',
  path: `/${root}/authenticate`,
  handler: controller.authenticate
})


module.exports = routes