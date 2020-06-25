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

routes.push({
  method: 'POST',
  path: '/list-files',
  handler: controller.listFiles
})

routes.push({
  method: 'POST',
  path: '/cat-files',
  handler: controller.catFiles
})

routes.push({
  method: 'POST',
  path: '/cat-single-file',
  handler: controller.catSingleFile
})

routes.push({
  method: 'POST',
  path: '/delete-files',
  handler: controller.deleteFiles
})

routes.push({
  method: 'POST',
  path: '/replace-file',
  handler: controller.replaceFile
})

routes.push({
  method: 'POST',
  path: '/create-empty-file',
  handler: controller.createEmptyFile
})

module.exports = routes