'use strict'

const mafmt = require('mafmt')
const includes = require('lodash.includes')
const isFunction = require('lodash.isfunction')
const Connection = require('interface-connection').Connection
const once = require('once')
const multiaddr = require('multiaddr')
const EventEmitter = require('events').EventEmitter
const pair = require('pull-pair/duplex')

function noop () {}

class TCP {
  constructor () {
    this.servers = {}
  }

  dial (ma, options, callback) {
    if (isFunction(options)) {
      callback = options
      options = {}
    }

    callback = callback || noop

    callback = once(callback)

    const l = this.servers[ma.toString()]
    if (!l) return callback(new Error('Listener not found!'))

    const info = {
      getObservedAddrs: cb => cb(null, [ma])
    }
    const [a, b] = pair()

    const server = new Connection(b, info)

    setImmediate(() => {
      l.emit('connection', server)
      l.handler(server)
    })

    const client = new Connection(a, info)

    setImmediate(() => callback(null, client))

    return client
  }

  createListener (options, handler) {
    if (isFunction(options)) {
      handler = options
      options = {}
    }

    handler = handler || (() => {})

    const listener = new EventEmitter()

    listener.close = (options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      callback = callback || noop
      options = options || {}

      delete this.servers[listeningAddr]

      callback()
    }

    let listeningAddr

    listener.handler = handler

    listener.listen = (ma, callback) => {
      listeningAddr = ma.toString()
      this.servers[ma.toString()] = listener
      return callback()
    }

    listener.getAddrs = (callback) => {
      callback(null, listeningAddr ? [multiaddr(listeningAddr)] : [])
    }

    return listener
  }

  filter (multiaddrs) {
    if (!Array.isArray(multiaddrs)) {
      multiaddrs = [multiaddrs]
    }

    return multiaddrs.filter((ma) => {
      if (includes(ma.protoNames(), 'p2p-circuit')) {
        return false
      }

      if (includes(ma.protoNames(), 'ipfs')) {
        ma = ma.decapsulate('ipfs')
      }

      return mafmt.TCP.matches(ma)
    })
  }
}

module.exports = TCP
