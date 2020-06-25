const fs = require('fs')
const path = require('path')
const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()
const _ = require('lodash')
const constants = require('./constants')
const util = require('util')
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

async function uploadFile(username, password, uploadFilePath) {
  let tempDirectoryPath = constants.tempDirectoryPath
  let testDirectoryPath = constants.testDirectoryPath
  let uploadedFileArr = uploadFilePath.split('/')
  let uploadedFile = uploadedFileArr[uploadedFileArr.length - 1]
  let res = null

  try {
    await ssh.connect({
      host: constants.host,
      port: constants.port,
      username: username,
      password: password
    })

    await exec(`sshpass -p '${password}' scp -P ${constants.port} ${uploadFilePath} ${username}@${constants.host}:${tempDirectoryPath}`)
    await ssh.execCommand(`chmod 777 ${tempDirectoryPath}/${uploadedFile}`)


    let fileSizeRes = await ssh.execCommand(`ls -l ${tempDirectoryPath}/${uploadedFile} | cut -d " " -f5`)
    let fileSize = _.get(fileSizeRes, 'stdout')
    let parsedFileSize = parseInt(fileSize)

    if(parsedFileSize <= 1024) {
      let filesNumRes = await ssh.execCommand(`cd ${testDirectoryPath} && ls | wc -l`)
      let filesNum = _.get(filesNumRes, 'stdout')
      let parsedFileNum = parseInt(filesNum)

      if(parsedFileNum < 7) {
        await ssh.execCommand(`cp ${tempDirectoryPath}/${uploadedFile} ${testDirectoryPath}`)
        await ssh.execCommand(`chmod 777 ${testDirectoryPath}/${uploadedFile}`)
      } else {
        await ssh.execCommand(`rm ${tempDirectoryPath}/${uploadedFile}`)
        res = {
          statusCode: 500,
          message: "There are already 7 files and you cannot upload more"
        }
      }
    } else {
      await ssh.execCommand(`rm ${tempDirectoryPath}/${uploadedFile}`)
       res = {
        statusCode: 500,
        message: 'File size is greater than 1024 bytes so, it cannot be uploaded to this directory'
      }
    }
    await ssh.execCommand(`rm ${tempDirectoryPath}/${uploadedFile}`)

    if(res) {
      return res
    }
  } catch (error) {
    res = {
      statusCode: 500,
      message: `Error in uploading file ${error}`
    }
  }
  res = {
    statusCode: 200,
    message: `${uploadedFile} is uploaded successfully`
  }

  return res
}

async function deleteTemp(username, password) {
  let tempDirectoryPath = constants.tempDirectoryPath
  try {
    await ssh.connect({
      host: constants.host,
      port: constants.port,
      username: username,
      password: password
    })
    await ssh.execCommand(`sudo rm -rf ${tempDirectoryPath}`)
    return {
      statusCode: 200,
      message: 'You have successfully quit VFMS.'
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: 'Unable to quit, please try again later'
    }
  }
}

async function listFiles(username, password) {
  let testDirectoryPath = constants.testDirectoryPath
  try {
    await ssh.connect({
      host: constants.host,
      port: constants.port,
      username: username,
      password: password
    })
    let response = await ssh.execCommand(`cd ${testDirectoryPath} && ls`)
    return {
      statusCode: 200,
      files: response.stdout,
      message: 'Retrieved files'
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: 'There was an error in listing the files. Please make sure that the directory exists'
    }
  }
}

async function catFiles(username, password) {
  let testDirectoryPath = constants.testDirectoryPath
  try {
    await ssh.connect({
      host: constants.host,
      port: constants.port,
      username: username,
      password: password
    })

    let response = await ssh.execCommand(`cd ${testDirectoryPath} && file -i * | grep -e "text/" -e "x-empty" | cut -d ":" -f1`)
    return {
      statusCode: 200,
      message: "Text files are retrieved",
      files: response.stdout
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: 'Could not get the text files from the current folder' 
    }
  }
}

async function catSingleFile(username, password, file) {
  let testDirectoryPath = constants.testDirectoryPath

  try {
    await ssh.connect({
      host: constants.host,
      port: constants.port,
      username: username,
      password: password
    })

    let response = await ssh.execCommand(`cat ${testDirectoryPath}/${file}`)
    return {
      statusCode: 200,
      content: response.stdout,
      message: 'Retrieved file contents successfully'
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: 'Unable to view the file right now'
    }
  }
}

async function deleteFiles(username, password, file) {
  let testDirectoryPath = constants.testDirectoryPath

  try {
    await ssh.connect({
      host: constants.host,
      port: constants.port,
      username: username,
      password: password
    })

    let response = await ssh.execCommand(`rm ${testDirectoryPath}/${file}`)
    return {
      statusCode: 200,
      message: 'File has been delete successfully'
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: `Unable to delete ${file} file`
    }
  }
}

async function replaceFile(username, password, file, uploadFilePath) {
  let tempDirectoryPath = constants.tempDirectoryPath
  let testDirectoryPath = constants.testDirectoryPath
  let res = {}

  let uploadedFileArr = uploadFilePath.split('/')
  let uploadedFile = uploadedFileArr[uploadedFileArr.length - 1]

  if(uploadedFile !== file) {
    return {
      statusCode: 500,
      message: 'Please name the files the same and try again'
    }
  }

  try {
    await ssh.connect({
      host: constants.host,
      port: constants.port,
      username: username,
      password: password
    })

    let response = await ssh.execCommand(`cat ${testDirectoryPath}/${file}`)
    
    if(response.code === 1) {
      return {
        statusCode: 500,
        message: `File ${file} does not exist in folder`
      }
    } else {
      await exec(`sshpass -p '${password}' scp -P ${constants.port} ${uploadFilePath} ${username}@${constants.host}:${tempDirectoryPath}`)
      await ssh.execCommand(`chmod 777 ${tempDirectoryPath}/${file}`)

      let fileSizeRes = await ssh.execCommand(`ls -l ${tempDirectoryPath}/${file} | cut -d " " -f5`)
      let fileSize = _.get(fileSizeRes, 'stdout')
      let parsedFileSize = parseInt(fileSize)

      if(parsedFileSize <= 1024) {
        await ssh.execCommand(`cp ${tempDirectoryPath}/${file} ${testDirectoryPath}`)
        await ssh.execCommand(`chmod 777 ${testDirectoryPath}/${file}`)

        res = {
          statusCode: 200,
          message: `File ${file} has been replaced successfully`
        }
      } else {
        await ssh.execCommand(`rm ${tempDirectoryPath}/${file}`)
         res = {
          statusCode: 500,
          message: 'File size is greater than 1024 bytes so, it cannot be uploaded to this directory'
        }
      }
      await ssh.execCommand(`rm ${tempDirectoryPath}/${file}`)
  
      if(res) {
        return res
      }
    }
  } catch (error) {
    console.log(error)
    res = {
      statusCode: 500,
      message: `Error in replacing the file ${file}`
    }
  }

  return res
}

async function createEmptyFile(username, password, file) {
  let testDirectoryPath = constants.testDirectoryPath

  try {
    await ssh.connect({
      host: constants.host,
      port: constants.port,
      username: username,
      password: password
    })

    await ssh.execCommand(`cd ${testDirectoryPath} && touch ${file}`)
    await ssh.execCommand(`chmod 777 ${testDirectoryPath}/${file}`)
    return {
      statusCode: 200,
      message: `${file} file has been created in the folder`
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: `Error in creating file ${file}`
    }
  }
}

module.exports = {
  getAccessibleFiles,
  create,
  authenticate,
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