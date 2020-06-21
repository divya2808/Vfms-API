const fs = require('fs')
const path = require('path')
const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()
const _ = require('lodash')
const constants = require('./constants')
const util = require('util');
const exec = util.promisify(require("child_process").exec)

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

async function uploadFile(username, password, path, uploadFilePath) {
  let uploadedFileArr = uploadFilePath.split('/')
  let uploadedFile = uploadedFileArr[uploadedFileArr.length - 1]
  try {
    await ssh.connect({
      host: constants.host,
      port: constants.port,
      username: username,
      password: password
    })

    let filesNumRes = await ssh.execCommand(`cd ${path} && ls | wc -l`)
    
    let filesNum = _.get(filesNumRes, 'stdout')

    if(filesNum < 7) {
      let command = `sshpass -p '${password}' scp -P ${constants.port} ${uploadFilePath} ${username}@${constants.host}:${path}`
      await exec(command)
      let fileSizeRes = await ssh.execCommand(`ls -l ${path}/${uploadedFile} | cut -d " " -f5`)
      let fileSize = _.get(fileSizeRes, 'stdout')
      let parsedFileSize = parseInt(fileSize)

      if(parsedFileSize <= 1024) {
        await ssh.execCommand(`chmod 777 ${path}/${uploadedFile}`)
      } else {
        await ssh.execCommand(`rm ${path}/${uploadedFile}`)
        return {
          statusCode: 500,
          message: 'File size is greater than 1024 bytes so, it cannot be uploaded to this directory'
        }
      }
    } else {
      return {
        statusCode: 500,
        message: "There are already 7 files and you cannot upload more"
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: `Error in uploading file ${error}`
    }
  }
  return {
    statusCode: 200,
    message: `${uploadedFile} is uploaded successfully to ${path}`
  }
}

module.exports = {
  getAccessibleFiles,
  create,
  authenticate,
  createDirectory,
  changePermissions,
  uploadFile
}