'use strict'

// This transport allows upgrades from normal ZeroNet connections to libp2p connections

const debug = require('debug')
const log = debug('zeronet:swarm:upgradeTransport')
const EE = require('events').EventEmitter
const Connection = require('interface-connection').Connection
const setImmediate = require('async/setImmediate')
const mh = require('multihashes')
const multiaddr = require('multiaddr')

const noop = () => {}

class UpgradeListener extends EE {
  constructor (handler) {
    super()
    this.handler = handler || noop
  }

  _conn (conn) {
    this.handler(conn)
    this.emit('connection', conn)
  }

  listen (ma, cb) {
    log('upgradeTransport listening on %s', ma)
    this.ma = ma
    cb()
  }

  /**
    * Gets the addresses the listener listens on
    * @param {function} callback
    * @returns {undefined}
    */
  getAddrs (callback) {
    setImmediate(() => callback(null, this.ma ? [this.ma] : []))
  }

  /**
    * Closes the listener
    * @param {function} callback
    * @returns {undefined}
    */
  close (callback) {
    callback = callback || noop
    callback()
  }
}

module.exports = class UpgradeTransport {
  constructor () {
    this.dials = {}
  }

  simulateConnection (conn) {
    log('fake connection event')
    this.listener._conn(conn)
  }

  simulateDial (conn, dialId) {
    log('fake dial #%s created', dialId)
    this.dials[dialId] = conn
    return multiaddr('/p2p-znjs-relay/ipfs/' + mh.toB58String(Buffer.from(dialId)))
  }

  /**
    * Dials a peer
    * @param {Multiaddr} ma - Multiaddr to dial to
    * @param {Object} opt
    * @param {function} cb
    * @private
    * @returns {Connection}
    */
  dial (ma, opt, cb) {
    if (typeof opt === 'function') {
      cb = opt
      opt = null
    }

    const id = mh.fromB58String(ma.toString().split('ipfs/')[1])
    const conn = this.dials[id]
    log('fake dial #%s called (ok=%s)', id, Boolean(conn))
    delete this.dials[id]
    if (conn) {
      setImmediate(() => cb(null, conn))
      return conn
    } else {
      setImmediate(() => cb(new Error('Fake conn with id ' + id + ' not found!')))
      return new Connection()
    }
  }

  /**
    * Creates a listener
    * @param {Object} options
    * @param {function} handler
    * @returns {Listener}
    */
  createListener (options, handler) {
    if (typeof options === 'function') {
      handler = options
      options = {}
    }

    const listener = this.listener = new UpgradeListener(handler)

    return listener
  }

  /**
    * Filters multiaddrs
    * @param {Multiaddr[]} multiaddrs
    * @returns {boolean}
    */
  filter (multiaddrs) {
    if (!Array.isArray(multiaddrs)) {
      multiaddrs = [multiaddrs]
    }

    return multiaddrs.filter((ma) => ma.toString().indexOf('p2p-znjs-relay') !== -1)
  }
}
