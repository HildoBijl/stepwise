// A PositionedVector is a combination of three vectors: start, vector, end. Always it holds that start + vector = end, so effectively two of the three define the full PositionedVector object. This is useful when you have a Vector somewhere in space. The properties of this object are (unsurprisingly) "start", "vector" and "end".

const { compareNumbers } = require('../numeric')
const { processOptions } = require('../../util/objects')
const { repeat } = require('../../util/functions')

const { ensureVector } = require('./Vector')
const { Line, ensureLine } = require('./Line')

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

	// getLinePartWithin takes a line. It considers the current (this) PositionedVector as a rectangle (with start and end as corners, diagonally across) and checks which part of the line is inside the rectangle. It returns that part as a PositionedVector. It returns null on a line that's outside the given rectangle.
	getLinePartWithin(line) {
		line = ensureLine(line, this.dimension)

		// Get the minimum and maximum factor of all the intersection points of the line with the box.
		let lower, upper
		repeat(this.dimension, axis => {
			// Special case: if the line is parallel to this axis, check if the given coordinate falls within the rectangle.
			if (compareNumbers(line.direction.getCoordinate(axis), 0)) {
				const coordinate = line.start.getCoordinate(axis)
				const bounds = ['start', 'end'].map(label => this[label].getCoordinate(axis)).sort()
				if (coordinate < bounds[0] || coordinate > bounds[1]) {
					lower = Infinity
					upper = -Infinity
				}
				return
			}

			// Find the factors of the points at which the line intersects with the given coordinates.
			const factors = ['start', 'end'].map(label => line.getFactorOfPointWithCoordinate(axis, this[label].getCoordinate(axis))).sort()

			// Update the minimum and maximum factor when appropriate.
			if (lower === undefined || factors[0] > lower)
				lower = factors[0]
			if (upper === undefined || factors[1] < upper)
				upper = factors[1]
		})

		// Check if the lower and upper limits are still sensible.
		if (upper < lower)
			return null

		// Set up a new PositionedVector.
		return new PositionedVector({
			start: line.getPointWithFactor(lower),
			end: line.getPointWithFactor(upper),
		})
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
		if (positionedVector.isZero()) {
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

	// hasMatchingPoint checks if the two positioned vectors have a point (start or end) in common, checking all four combinations.
	hasMatchingPoint(positionedVector) {
		positionedVector = ensurePositionedVector(positionedVector)
		const points = ['start', 'end']
		return points.some(point1 => points.some(point2 => this[point1].equals(positionedVector[point2])))
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