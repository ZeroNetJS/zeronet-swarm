/* eslint-env mocha */

'use strict'

const createNode = require('./utils').createNode
const multiaddr = require('multiaddr')
const WS = require('libp2p-websockets')

let swarm

describe('zero relay', () => {
  before(done => {
    createNode({
      relay: ['/dns/znjs-relay.servep2p.com/tcp/443/wss/p2p-znjs-relay'],
      zero: {
        listen: [],
        crypto: false
      },
      libp2p: {
        transports: [new WS()],
        listen: []
      }
    }, (err, _swarm) => {
      if (err) return done(err)
      swarm = _swarm
      done()
    }, true)
  })

  it('should handshake and ping', (cb) => {
    swarm.dial(multiaddr('/ip4/216.189.144.82/tcp/15441'), 'ping', {}, cb)
  })

  after(function (done) {
    this.timeout(5000)
    swarm.stop(done)
  })
})
