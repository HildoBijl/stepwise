// A PositionedVector is a combination of three vectors: start, vector, end. Always it holds that start + vector = end, so effectively two of the three define the full PositionedVector object. This is useful when you have a Vector somewhere in space. The properties of this object are (unsurprisingly) "start", "vector" and "end".

const { processOptions } = require('../../util/objects')
const { ensureVector } = require('./Vector')
const { Line } = require('./Line')

const defaultPositionedVector = {
	start: undefined,
	vector: undefined,
	end: undefined,
}

class PositionedVector {
	/*
	 * Creation methods.
	 */

	constructor(positionedVector) {
		// Check the input type.
		if (typeof positionedVector !== 'object')
			throw new Error(`Invalid PositionedVector value: expected to receive some kind of object, but instead received something of type "${typeof positionedVector}".`)

		// Check if it already is a PositionedVector.
		if (positionedVector instanceof PositionedVector)
			return positionedVector

		// Process the PositionedVector.
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
				throw new Error(`Invalid PositionedVector: the given vector "${positionedVector.vector}" is not the difference between the start "${start}" and the end "${end}".`)
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
		return `PositionedVector({ start: ${this.start}, vector: ${this.vector}, end: ${this.end} })`
	}

	get line() {
		return new Line({ start: this.start, direction: this.vector })
	}

	/*
	 * Comparison methods.
	 */

	// equals runs an exact equality check on the full set-up.
	equals(positionedVector) {
		return this.start.equals(positionedVector.start) && this.vector.equals(positionedVector.vector)
	}

	// alongEqualLine checks if the two positioned vectors are along the same line.
	alongEqualLine(positionedVector, requireSameDirection) {
		positionedVector = ensurePositionedVector(positionedVector)

		// Check for zero vectors.
		if (positionedVector.squaredMagnitude === 0) {
			if (this.vector.squaredMagnitude === 0)
				return true
			return this.line.isPointOnLine(positionedVector.start)
		}
		if (this.vector.squaredMagnitude === 0)
			return positionedVector.alongEqualLine(this, requireSameDirection)

		// Compare lines.
		return this.line.equals(positionedVector.line, requireSameDirection)
	}

	/*
	 * Static methods.
	 */

	// None yet.
}
module.exports.PositionedVector = PositionedVector

// ensurePositionedVector ensures that the given parameter is a PositionedVector object. If not, it tries to turn it into one, or throws an error upon failure. Optionally, a dimension may be given which is then checked too.
function ensurePositionedVector(positionedVector, dimension) {
	// Ensure that we have a PositionedVector.
	positionedVector = new PositionedVector(positionedVector)

	// If a required dimension is specified, check this.
	if (dimension !== undefined && positionedVector.dimension !== dimension)
		throw new Error(`Invalid PositionedVector dimension: expected a PositionedVector of dimension ${dimension} but received one of dimension ${positionedVector.dimension}.`)

	// All in order.
	return positionedVector
}
module.exports.ensurePositionedVector = ensurePositionedVector