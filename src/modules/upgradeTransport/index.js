'use strict'

const Upgrade = require('./transport')

const debug = require('debug')
const log = debug('zeronet:swarm:upgradeTransport')

module.exports = function () {
  this.hooks = {
    pre: (opt) => {
      if ((opt.libp2p || opt.libp2p == null) && (opt.zero || opt.zero == null)) {
        log('enabling')
        let transport = this.transport = new Upgrade()
        opt.libp2p.transports = (opt.libp2p.transports || []).concat([transport])
        opt.libp2p.listen = (opt.libp2p.listen || []).concat(['/p2p-znjs-relay'])
      }
    },
    postLp2p: lp2p => {
      if (this.transport) lp2p.up = this.transport
    }
  }
}
