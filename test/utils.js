'use strict'

const TCP = require('./tcp')
const Swarm = require('../')
const PeerId = require('peer-id')
const PeerPool = require('zeronet-common/src/peer/pool').MainPool

module.exports = {
  createNode: (conf, done, notcp) => {
    PeerId.createFromJSON(require('./id'), (err, id) => {
      if (err) return done(err)
      if (!notcp) {
        if (conf.zero) conf.zero.transports = [new TCP()]
        else if (conf.zero === null) conf.zero = {transports: [new TCP()], listen: []}
        if (conf.libp2p) conf.libp2p.transports = [new TCP()]
        else if (conf.libp2p === null) conf.libp2p = {transports: [new TCP()], listen: []}
      }
      const zeronet = {
        rev: '0',
        version: 'v0',
        peer_id: Math.random().toString(),
        peerPool: new PeerPool()
      }
      conf.id = id
      const swarm = new Swarm(conf, zeronet, Swarm.modules.all())
      zeronet.swarm = swarm
      swarm.start(err => {
        if (err) return done(err)
        done(null, swarm)
      })
    })
  }
}
