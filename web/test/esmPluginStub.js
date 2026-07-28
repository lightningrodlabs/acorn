// Stands in for ESM-only remark plugins (remark-gfm) under jest. Component
// tests mock the markdown renderer, so the plugin is never invoked — it only
// has to be importable.
module.exports = function esmPluginStub() {}
module.exports.default = module.exports
