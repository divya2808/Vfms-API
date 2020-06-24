let routes = []

const root = 'users'
const controller = require('./controller')

routes.push({
  method: 'GET',
  path: `/${root}/files`,
  handler: controller.getUserAccessibleFiles
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

routes.push({
  method: 'POST',
  path: `/${root}/create-directory`,
  handler: controller.createDirectory
})

routes.push({
  method: 'POST',
  path: `/${root}/change-permissions`,
  handler: controller.changePermissions
})

routes.push({
  method: 'POST',
  path: `/${root}/upload-file`,
  handler: controller.uploadFile
})

routes.push({
  method: 'POST',
  path: '/quit',
  handler: controller.deleteTemp
})

module.exports = routes