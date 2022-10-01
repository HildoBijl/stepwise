const { compareNumbers } = require('../../../../util/numbers')
const { Vector, Span } = require('../../../../geometry')

const { loadTypes } = require('./definitions')

function reverseLoad(load) {
	switch (load.type) {
		case loadTypes.force:
			return { ...load, span: load.span.reverse() }

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
		return loads
	if (compareNumbers(load.span.vector.x, 0) || compareNumbers(load.span.vector.y, 0))
		return load

	// Set up an array of two loads with identical properties.
	const spanObject = toEnd ? { end: load.span.end } : { start: load.span.start }
	return [
		{ ...load, span: new Span({ ...spanObject, vector: load.span.vector.getProjectionOn(Vector.i) }) },
		{ ...load, span: new Span({ ...spanObject, vector: load.span.vector.getProjectionOn(Vector.j) }) },
	]
}
module.exports.decomposeForce = decomposeForce