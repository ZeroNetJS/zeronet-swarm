'use strict'

// 2 swarms
// Libp2p on *:15542
// ZNv2 on *:15543
// don't ever put 2 swarms on the same port

// basics
const ZeroSwarm = require('./zero')
const Lp2pSwarm = require('./lp2p')
const Dial = require('./dial')
const series = require('async/series')
const Protocol = require('zeronet-protocol')

function callHook (modules, hook, ...a) {
  modules.forEach(m => {
    const fnc = (m.hooks || {})[hook]
    if (typeof fnc === 'function') fnc(...a)
  })
}

function ZeroNetSwarm (opt, zeronet, modules) {
  const self = this

  modules = modules || []

  /*
    Module hooks:
      - pre: opt, zeronet, protocol
      - postLibp2p(if libp2p enabled): lp2p
      - postZero(if zero enabled): zero
      - post: self, swarms
  */

  const protocol = self.protocol = new Protocol()
  let swarms = []

  callHook(modules, 'pre', opt, zeronet, protocol)

  // libp2p
  if (opt.libp2p === null) opt.libp2p = {}
  if (opt.libp2p) {
    opt.libp2p.id = opt.id
    const lp2p = self.lp2p = self.libp2p = new Lp2pSwarm(opt.libp2p, protocol, zeronet)
    swarms.push(lp2p)
    protocol.setLp2p(lp2p)
    callHook(modules, 'postLp2p', lp2p)
  }

  // znv2
  if (opt.zero === null) opt.zero = {}
  if (opt.zero) {
    opt.zero.id = opt.id
    const zero = self.zero = new ZeroSwarm(opt.zero, protocol, zeronet, self.lp2p)
    swarms.push(zero)
    protocol.setZero(zero)
    callHook(modules, 'postZero', zero)
  }

  self.start = cb => series(swarms.map(s => s.start), cb)

  self.stop = cb => series(swarms.map(s => s.stop), cb)

  self.dial = Dial(self.zero, self.lp2p)

  protocol.handle('ping', {
    in: {
      protobuf: {},
      strict: {}
    },
    out: {
      protobuf: {
        1: 'string body'
      },
      strict: {
        body: [
          b => Boolean(b === 'Pong!')
        ]
      }
    }
  }, (data, cb) => cb(null, {
    body: 'Pong!'
  }))

  callHook(modules, 'post', self, swarms)
}

module.exports = ZeroNetSwarm
module.exports.ZeroSwarm = ZeroSwarm
module.exports.Lp2pSwarm = Lp2pSwarm
