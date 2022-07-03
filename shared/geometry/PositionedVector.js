// A PositionedVector is a combination of three vectors: start, vector, end. Always it holds that start + vector = end, so effectively two of the three define the full PositionedVector object. This is useful when you have a Vector somewhere in space. The properties of this object are (unsurprisingly) "start", "vector" and "end".

const { processOptions } = require('../util/objects')

const { ensureVector } = require('./Vector')
const { Line, ensureLine } = require('./Line')
const { ensureTransformation } = require('./Transformation')

const defaultPositionedVector = {
	start: undefined,
	vector: undefined,
	end: undefined,
}

const pointNames = ['start', 'end']

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

	get SO() {
		return {
			start: this.start.SO,
			end: this.end.SO,
		}
	}

	get type() {
		return this.constructor.type
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
		if (this.vector.isZero())
			throw new Error(`Invalid line request: cannot give the line of a PositionedVector with zero magnitude.`)
		return new Line(this.start, this.vector)
	}

	/*
	 * Manipulation and calculation methods.
	 */

	// reverse turns the vector around, making it go from end to start.
	reverse() {
		return new PositionedVector({ start: this.end, end: this.start })
	}

	// round takes all coordinates and rounds them to the nearest value.
	round() {
		return new PositionedVector({ start: this.start.round(), end: this.end.round() })
	}

	// transform applies a given transformation.
	transform(transformation, ...args) {
		transformation = ensureTransformation(transformation, this.dimension)
		return new PositionedVector({
			start: transformation.apply(this.start, ...args),
			end: transformation.apply(this.end, ...args),
		})
	}

	// add and subtract will add/subtract a vector to the start and end vectors of the PositionedVector, effectively shifting the positioned vector.
	add(vector) {
		return new PositionedVector({ start: this.start.add(vector), end: this.end.add(vector) })
	}
	subtract(vector) {
		return new PositionedVector({ start: this.start.subtract(vector), end: this.end.subtract(vector) })
	}

	/*
	 * Comparison methods.
	 */

	// equals runs an exact equality check on the full set-up.
	equals(positionedVector, allowReverse = false) {
		if (this.start.equals(positionedVector.start) && this.end.equals(positionedVector.end))
			return true
		if (allowReverse && this.start.equals(positionedVector.end) && this.end.equals(positionedVector.start))
			return true
		return false
	}

	// alongEqualLine checks if the two Positioned Vectors are along the same line. (Special case: two zero positioned vectors are always along the same line.)
	alongEqualLine(positionedVector, requireSameDirection, requireMatchingPoint = false) {
		positionedVector = ensurePositionedVector(positionedVector)

		// Check for an extra requirement.
		if (requireMatchingPoint && !this.hasMatchingPoint(positionedVector))
			return false

		// Check for zero vectors. If they are not around, take the line and check if the other PositionedVector is along it.
		if (positionedVector.vector.isZero()) {
			if (this.vector.isZero())
				return true
			return positionedVector.isAlongLine(this.line, requireSameDirection)
		}
		return this.isAlongLine(positionedVector.line, requireSameDirection)
	}

	// isAlongLine checks if this positioned vector is along the given Line.
	isAlongLine(line, requireSameDirection = false) {
		line = ensureLine(line)

		// Check for a zero vector, meaning this PositionedVector is a point. If so, there is no direction, so the direction is off anyway. If that's not important, check if the point is on the line.
		if (this.vector.isZero())
			return !requireSameDirection && line.containsPoint(this.start)

		// Compare lines.
		return this.line.equals(line, requireSameDirection)
	}

	// hasPoint checks if this PositionedVector has one of its endpoints at the given point.
	hasPoint(point) {
		point = ensureVector(point, this.dimension)
		return pointNames.some(pointName => this[pointName].equals(point))
	}

	// hasMatchingPoint checks if the two positioned vectors have a point (start or end) in common, checking all four combinations.
	hasMatchingPoint(positionedVector) {
		positionedVector = ensurePositionedVector(positionedVector, this.dimension)
		return pointNames.some(pointName => this.hasPoint(positionedVector[pointName]))
	}

	/*
	 * Static methods.
	 */

	// None yet.
}
PositionedVector.type = 'PositionedVector'
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