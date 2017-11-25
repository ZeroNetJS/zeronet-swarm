'use strict'

const TCP = require('libp2p-tcp')
const Swarm = require('../')
const PeerId = require('peer-id')
const PeerPool = require('zeronet-common/src/peer/pool').MainPool

module.exports = {
  createNode: (conf, done) => {
    PeerId.createFromJSON(require('./id'), (err, id) => {
      if (err) return done(err)
      if (conf.zero) conf.zero.transports = [new TCP()]
      else conf.zero = {transports: [new TCP()], listen: []}
      if (conf.libp2p) conf.libp2p.transports = [new TCP()]
      else conf.libp2p = {transports: [new TCP()], listen: []}
      const zeronet = {
        rev: '0',
        version: 'v0',
        peerPool: new PeerPool()
      }
      conf.id = id
      const swarm = new Swarm(conf, zeronet)
      zeronet.swarm = swarm
      swarm.start(err => {
        if (err) return done(err)
        done(null, swarm)
      })
    })
  }
}
