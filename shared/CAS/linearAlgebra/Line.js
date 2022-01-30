// A Line is a line inside a (possibly multi-dimensional) space. It is like a PositionedVector, but then it has no magnitude. It's all about the position and the direction.

const { processOptions } = require('../../util/objects')
const { Vector, ensureVector } = require('./Vector')

const defaultLine = {
	start: undefined,
	direction: undefined,
}

class Line {
	/*
	 * Creation methods.
	 */

	constructor(line) {
		// On a line, just return it directly.
		if (line instanceof Line)
			return line

		// Ensure that we have an object.
		if (typeof line !== 'object')
			throw new Error(`Invalid Line: expected an object that could be turned into a Line, but received something of type "${typeof line}".`)

		// Check that the given parameters are valid and of equal dimension.
		line = processOptions(line, defaultLine)
		this.start = ensureVector(line.start)
		this.direction = ensureVector(line.direction, this.start.dimension)
		if (this.direction.magnitude === 0)
			throw new Error(`Invalid Line direction: cannot accept a direction Vector with zero magnitude.`)
	}

	/*
	 * Getting and setting.
	 */

	get perpendicularVector() {
		this.start = this.start.getPerpendicularComponent(this.direction)
	}

	get normalizedDirection() {
		return this.direction.normalize()
	}

	get angle() {
		if (this.dimension !== 2)
			throw new Error(`Invalid angle call: cannot retrieve the angle of a ${this.dimension}D line.`)
		return this.direction.argument
	}

	get distance() {
		return this.perpendicularVector.magnitude
	}

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
		return `Line({ start: ${this.start}, direction: ${this.vector} })`
	}

	normalize() {
		return new Line({ start: this.perpendicularVector, direction: this.normalizedDirection })
	}

	reverse() {
		return new Line({ start: this.start, direction: this.direction.reverse() })
	}

	/*
	 * Comparison methods.
	 */

	// equals runs an exact equality check on the full set-up.
	equals(line, requireSameDirection = false) {
		line = ensureLine(line)

		// Check the starting point of the lines.
		if (!this.perpendicularVector.equals(line.perpendicularVector))
			return false

		// Check the directions of the lines.
		const dotProduct = this.normalizedDirection.dotProduct(line.normalizedDirection)
		return (requireSameDirection ? dotProduct : Math.abs(dotProduct)) === 1
	}

	// isPointOnLine checks if a given point (Vector) is on the given line. 
	isPointOnLine(vector) {
		vector = ensureVector(vector)

		// Find the vector relative to the line's start and check if it's in the right direction.
		const relativeVector = vector.subtract(this.start)
		return relativeVector.magnitude === 0 || Math.abs(this.normalizedDirection.dotProduct(relativeVector.normalize())) === 1
	}

	/*
	 * Static methods.
	 */

	// fromAngleAndDistance creates a 2D line with the given angle (argument) and the given distance from the origin. It is assumed that, after traveling the given distance, we turn a hard left to go into the given angle. So (Math.PI/2, 3) lets us go three steps to the right before we go straight up. Similarly, (Math.PI*3/2, 4) lets us go four steps to the left before going straight down.
	fromAngleAndDistance(angle, distance) {
		return new Line({
			start: Vector.fromPolar(distance, angle - Math.PI / 2),
			direction: Vector.fromPolar(1, angle),
		})
	}

	// None yet.
}
module.exports.Line = Line

// ensureLine turns the given line parameter into a Line object or dies trying. It can optionally also check for the given dimension.
function ensureLine(line, dimension) {
	// Ensure that we have a Line.
	line = new Line(line)

	// If a required dimension is specified, check this.
	if (dimension !== undefined && line.dimension !== dimension)
		throw new Error(`Invalid Line dimension: expected a Line of dimension ${dimension} but received one of dimension ${line.dimension}.`)

	// All in order. Return the Line.
	return line
}
module.exports.ensureLine = ensureLine