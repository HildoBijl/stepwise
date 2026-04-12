const { compareNumbers } = require('@step-wise/utils')
const { Vector, LineSegment } = require('@step-wise/geometry')

const { loadTypes } = require('./definitions')

function reverseLoad(load) {
	switch (load.type) {
		case loadTypes.force:
			return { ...load, anchoredVector: load.anchoredVector.reverse() }

		case loadTypes.moment:
			return { ...load, clockwise: !load.clockwise }

		default:
			throw new Error(`Unknown load type: could not flip load of type "${input.type}" since this type is unknown.`)
	}
}
module.exports.reverseLoad = reverseLoad

function decomposeForce(load, toEnd = true) {
	// Check that it's a diagonal force. If not, do nothing with it.
	if (load.type !== loadTypes.force)
		return load
	if (compareNumbers(load.anchoredVector.vector.x, 0) || compareNumbers(load.anchoredVector.vector.y, 0))
		return load

	// Set up an array of two loads with identical properties.
	const lineSegmentObject = toEnd ? { end: load.anchoredVector.end } : { start: load.anchoredVector.start }
	return [
		{ ...load, anchoredVector: new LineSegment({ ...lineSegmentObject, vector: load.anchoredVector.vector.projectOnto(Vector.i) }) },
		{ ...load, anchoredVector: new LineSegment({ ...lineSegmentObject, vector: load.anchoredVector.vector.projectOnto(Vector.j) }) },
	]
}
module.exports.decomposeForce = decomposeForce
