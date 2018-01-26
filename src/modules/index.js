'use strict'

const mods = {
  upgradeTransport: require('./upgradeTransport')
}
Object.keys(mods).forEach(mod => {
  module.exports[mod] = (...a) => new mods[mod](...a)
})
module.exports.all = () => Object.keys(mods).map(k => mods[k]).map(Module => new Module())
