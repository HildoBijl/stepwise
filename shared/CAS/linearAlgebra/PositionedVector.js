// A PositionedVector is a combination of three vectors: start, vector, end. Always it holds that start + vector = end, so effectively two of the three define the full PositionedVector object. This is useful when you have a Vector somewhere in space. The properties of this object are (unsurprisingly) "start", "vector" and "end".

const { processOptions } = require('../../util/objects')
const { ensureVector } = require('./Vector') // TODO: PUT BACK TO CENTRAL FUNCTION.

const defaultPositionedVector = {
	start: undefined,
	vector: undefined,
	end: undefined,
}
const cannotChangeError = 'Invalid command: cannot adjust the properties of a PositionedVector. If needed, you must create a new PositionedVector.'

class PositionedVector {
	/*
	 * Creation methods.
	 */

	constructor(positionedVector) {
		positionedVector = processOptions(positionedVector, defaultPositionedVector)
		if (!positionedVector.end) {
			this.start = ensureVector(positionedVector.start)
			this.vector = ensureVector(positionedVector.vector, this.start.dimension)
			this.end = this.start.add(this.vector)
		} else if (!positionedVector.start) {
			this.end = ensureVector(positionedVector.end)
			this.vector = ensureVector(positionedVector.vector, this.end.dimension)
			this.start = this.end.subtract(this.vector)
		} else {
			this.start = ensureVector(positionedVector.start)
			this.end = ensureVector(positionedVector.end, this.start.dimension)
			this.vector = this.end.subtract(this.start)
			if (positionedVector.vector && !this.vector.equals(positionedVector.vector))
				throw new Error(`Invalid start-vector-end combination: the given vector "${positionedVector.vector}" is not the difference between the start "${start}" and the end "${end}".`)
		}
	}

	/*
	 * Getting and setting.
	 */

	// No functions.

	/*
	 * Derived properties.
	 */

	get dimension() {
		return this.start.dimension
	}

	get str() {
		return this.toString()
	}

	toString() {
		return `{ start: ${this.start}, vector: ${this.vector}, end: ${this.end} }`
	}

	/*
	 * Comparison methods.
	 */

	// equals runs an exact equality check on the full set-up.
	equals(positionedVector) {
		return this.start.equals(positionedVector.start) && this.vector.equals(positionedVector.vector)
	}

	// equalLine checks if two Positioned Vectors have an equal line.
	// ToDo

	// equalLineAndDirection checks if two Positioned Vectors have an equal line with equal direction.
	// ToDo

	/*
	 * Static methods.
	 */

	// None yet.
}
module.exports.PositionedVector = PositionedVector

// ensurePositionedVector ensures that the given parameter is a PositionedVector object. If not, it tries to turn it into one, or throws an error upon failure. Optionally, a dimension may be given which is then checked too.
function ensurePositionedVector(positionedVector, dimension) {
	// Check the input type.
	if (typeof positionedVector !== 'object')
		throw new Error(`Invalid PositionedVector object: expected to receive some kind of object, but instead received something of type "${typeof positionedVector}".`)

	// Try to turn it into a Positioned Vector.
	positionedVector = (positionedVector instanceof PositionedVector ? positionedVector : new PositionedVector(positionedVector))

	// If a required dimension is specified, check this.
	if (dimension !== undefined && positionedVector.dimension !== dimension)
		throw new Error(`Invalid PositionedVector dimension: expected a PositionedVector of dimension ${dimension} but received one of dimension ${positionedVector.dimension}.`)

	// All in order. Return the vector.
	return positionedVector
}
module.exports.ensurePositionedVector = ensurePositionedVector