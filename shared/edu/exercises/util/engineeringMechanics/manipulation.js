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