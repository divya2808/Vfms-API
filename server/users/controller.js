const service = require('./service')
const _ = require('lodash')

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

async function getUserAccessibleFiles(req) {
  let username = req.headers.username
  let password = req.headers.password
  return await service.getAccessibleFiles(username, password)
}

async function createDirectory(req) {
  let username = req.payload.username
  let password = req.payload.password
  let folderName = req.payload.folderName
  return await service.createDirectory(username, password, folderName)
}

async function changePermissions(req) {
  let username = req.payload.username
  let password = req.payload.password
  let filePath = _.get(req, 'payload.fileName')
  let directoryPath = _.get(req, 'payload.directoryName')
  let permission = req.payload.permission
  let user = req.payload.accessUser
  return await service.changePermissions(username, password, user, filePath, directoryPath, permission)
}

async function uploadFile(req) {
  let username = req.payload.username
  let password = req.payload.password
  let path = req.payload.path
  let uploadFilePath = req.payload.uploadFilePath
  return await service.uploadFile(username, password, path, uploadFilePath)
}


module.exports = {
  create,
  authenticate,
  getUserAccessibleFiles,
  createDirectory,
  changePermissions,
  uploadFile
}