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
  let uploadFilePath = req.payload.uploadFilePath
  return await service.uploadFile(username, password, uploadFilePath)
}

async function deleteTemp(req) {
  let username = req.payload.username
  let password = req.payload.password
  return await service.deleteTemp(username, password)
}

async function listFiles(req) {
  let username = req.payload.username
  let password = req.payload.password
  return await service.listFiles(username, password)
}

async function catFiles(req) {
  let username = req.payload.username
  let password = req.payload.password
  return await service.catFiles(username, password)
}

async function catSingleFile(req) {
  let username = req.payload.username
  let password = req.payload.password
  let file = req.payload.file
  return await service.catSingleFile(username, password, file)
}

async function deleteFiles(req) {
  let username = req.payload.username
  let password = req.payload.password
  let file = req.payload.file
  return await service.deleteFiles(username, password, file)
}

async function replaceFile(req) {
  let username = req.payload.username
  let password = req.payload.password
  let file = req.payload.file
  let uploadFilePath = req.payload.uploadFilePath
  return await service.replaceFile(username, password, file, uploadFilePath)
}

async function createEmptyFile(req) {
  let username = req.payload.username
  let password = req.payload.password
  let file = req.payload.file
  return await service.createEmptyFile(username, password, file)
}

module.exports = {
  create,
  authenticate,
  getUserAccessibleFiles,
  createDirectory,
  changePermissions,
  uploadFile,
  deleteTemp,
  listFiles,
  catFiles,
  catSingleFile,
  deleteFiles,
  replaceFile,
  createEmptyFile
}