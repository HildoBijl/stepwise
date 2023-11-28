// The Vector class represents a point in space.

const { Vector } = require('../geometry')

module.exports.Vector = Vector
module.exports.SOtoFO = SO => new Vector(SO)
