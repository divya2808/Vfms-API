const fs = require('fs')
const path = require('path')
const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()
const _ = require('lodash')
const constants = require('./constants')

async function getAccessibleFiles(username, password) {
  try {
    await ssh.connect({
      host: constants.host,
      port: constants.port,
      username: username,
      password: password
    })
    let response = await ssh.execCommand('cd && ls -lh | less')
    return {
      statusCode: 200,
      message: 'Fetched files successfully',
      response: response.stdout
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: 'Could not fetch user files'
    }
  }
}

async function create(username, password) {
  try {
    await ssh.connect({
      host: constants.host,
      port: constants.port,
      username: constants.adminUser,
      password: constants.adminPassword 
    })
    await ssh.execCommand(`sudo useradd -m -d /home/${username} ${username} -p $(openssl passwd -1 ${password} && chown ${username}:${username} /home/${username})`)
    return {
      statusCode: 200,
      message: `${username} created on the ubuntu server`
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      message: `Error creating user ${username}`
    }
  }
}

async function authenticate(username, password) {
  try {
    await ssh.connect({
      host: constants.host,
      port: constants.port,
      username: username,
      password: password
    })
    let home = await ssh.execCommand('pwd')
    if(home.code === null) {
      return {
        statusCode: 200,
        message: 'Authentication Successful',
        home: home.stdout
      }
    } else {
      return {
        statusCode: 500,
        message: 'Authentication Failed'
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: 'Authentication Failed'
    }
  }
}

async function createDirectory(username, password, folderName) {
  try {
    await ssh.connect({
      host: constants.host,
      port: constants.port,
      username: username,
      password: password
    })
    await ssh.execCommand(`mkdir ${folderName}`)
    return {
      statusCode: 200,
      message: `${folderName} has been created`
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: 'Error creating a directory'
    }
  }
}

async function changePermissions(username, password, user, filePath, directoryPath, permission) {
  let path = ''
  if(filePath) {
    path = filePath
  } else if (directoryPath) {
    path = directoryPath
  }
  try {
    await ssh.connect({
      host: constants.host,
      port: constants.port,
      username: username,
      password: password
    })
    await ssh.execCommand(`setfacl -R -m u:${user}:${permission} ${path}`)
    return {
      statusCode: 200,
      message: 'Permissions are changed'
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: 'Permissions could not be changed'
    }
  }
}

module.exports = {
  getAccessibleFiles,
  create,
  authenticate,
  createDirectory,
  changePermissions
}