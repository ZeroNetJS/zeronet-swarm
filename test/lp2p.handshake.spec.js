/* eslint-env mocha */

'use strict'

const multiaddr = require('multiaddr')
const createNode = require('./utils').createNode

let swarm

describe('lp2p handshake', () => {
  before(done => {
    createNode({
      zero: {
        listen: [
          '/ip4/127.0.0.1/tcp/25335'
        ],
        crypto: false
      },
      libp2p: {
        listen: [
          '/ip4/127.0.0.1/tcp/25533'
        ]
      }
    }, (err, _swarm) => {
      if (err) return done(err)
      swarm = _swarm
      done()
    })
  })

  it('should handshake and ping', (cb) => {
    swarm.dial(swarm.lp2p.lp2p.peerInfo, 'ping', {}, cb)
  })

  it('should upgrade, handshake and ping', (cb) => {
    swarm.lp2p.lp2p.switch.muxedConns = {} // force re-connect
    swarm.dial(multiaddr('/ip4/127.0.0.1/tcp/25335'), 'ping', {}, err => {
      if (err) return cb(err)
      if (new Error('.').stack.indexOf('src/stream/msgpack.js') !== -1) return cb(new Error('Used zeronet (non-libp2p) stream!'))
      cb()
    })
  })

  after(function (done) {
    this.timeout(5000)
    swarm.stop(done)
  })
})
