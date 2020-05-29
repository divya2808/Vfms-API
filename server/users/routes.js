let routes = []

const root = 'users'
const controller = require('./controller')

routes.push({
  method: 'GET',
  path: `/${root}`,
  handler: controller.getUsers
})


module.exports = routes