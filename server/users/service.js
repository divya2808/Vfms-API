const fs = require('fs')
const path = require('path')
const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()
const userAuthentication = require('../userAuthentication')
const _ = require('lodash')

function getUsers() {
  ssh.connect({
    host: '127.0.0.1',
    port: 2222,
    username: 'ubuntu',
    privateKey: '/Users/kandlakd/.ssh/id_rsa'
  }).then(function() {
    ssh.execCommand('sudo useradd -p $(openssl passwd -1 welcome) user1').then(function(result) {
      console.log('STDOUT: ' + result.stdout)
    }, function(error) {
      console.log(error)
    })
  })
  return {}
}

async function create(username, password) {
  try {
    await ssh.connect({
      host: '127.0.0.1',
      port: 2222,
      username: 'ubuntu',
      privateKey: '/Users/kandlakd/.ssh/id_rsa' 
    })
    await ssh.execCommand(`sudo useradd -m -d /home/${username} ${username} -p $(openssl passwd -1 ${password})`)
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
      host: '127.0.0.1',
      port: 2222,
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

module.exports = {
  getUsers,
  create,
  authenticate
}