/* eslint-env mocha */

'use strict'

const createNode = require('./utils').createNode
const multiaddr = require('multiaddr')

let swarm

describe('zero handshake', () => {
  before(done => {
    createNode({
      zero: {
        listen: [
          '/ip4/127.0.0.1/tcp/25335'
        ],
        crypto: false
      },
      lp2p: false
    }, (err, _swarm) => {
      if (err) return done(err)
      swarm = _swarm
      done()
    })
  })

  it('should handshake and ping', (cb) => {
    swarm.dial(multiaddr('/ip4/127.0.0.1/tcp/25335'), 'ping', {}, cb)
  })

  after(function (done) {
    this.timeout(5000)
    swarm.stop(done)
  })
})
