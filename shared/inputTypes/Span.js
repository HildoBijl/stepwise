// The Span class represents two points in space: a start and an end.

const { Span } = require('../geometry')

module.exports.Span = Span
module.exports.SOtoFO = SO => new Span(SO)
