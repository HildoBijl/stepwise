// The LineSegment class represents two points in space: a start and an end.

const { LineSegment } = require('@step-wise/geometry')

module.exports.LineSegment = LineSegment
module.exports.SOtoFO = SO => new LineSegment(SO)
