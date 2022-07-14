// The Rectangle represents a rectangle shape in space. It is based on the PositionedVector which denotes its position, but it adds functionalities on top like bounding coordinates and more.

const { ensureNumber, compareNumbers, boundTo } = require('../util/numbers')
const { numberArray } = require('../util/arrays')
const { repeat } = require('../util/functions')

const { ensureVector } = require('./Vector')
const { PositionedVector, ensurePositionedVector } = require('./PositionedVector')
const { Line, ensureLine } = require('./Line')

class Rectangle {
	/*
	 * Creation methods.
	 */

	constructor(rectangle) {
		if (rectangle instanceof Rectangle)
			return rectangle

		// Turn the data into a Positioned Vector.
		this.positionedVector = ensurePositionedVector(rectangle)
	}

	get SO() {
		return this.positionedVector.SO
	}

	get type() {
		return this.constructor.type
	}

	/*
	 * Getting and setting.
	 */

	get start() {
		return this.positionedVector.start
	}

	get vector() {
		return this.positionedVector.vector
	}

	get end() {
		return this.positionedVector.end
	}

	// No functions.

	/*
	 * Derived properties.
	 */

	get dimension() {
		return this.positionedVector.dimension
	}

	get str() {
		return this.toString()
	}

	toString() {
		return `Rectangle({ start: ${this.start}, end: ${this.end} })`
	}

	get line() {
		if (this.vector.isZero())
			throw new Error(`Invalid line request: cannot give the line of a PositionedVector with zero magnitude.`)
		return new Line(this.start, this.vector)
	}

	get width() {
		if (this.dimension !== 2)
			throw new Error(`Invalid width request: cannot give the width of a ${this.dimension}D rectangle. This is only possible for 2D rectangles.`)
		return this.getSize(0)
	}
	get height() {
		if (this.dimension !== 2)
			throw new Error(`Invalid height request: cannot give the height of a ${this.dimension}D rectangle. This is only possible for 2D rectangles.`)
		return this.getSize(1)
	}

	// getBounds gives the bounds of this rectangle along a certain axis. It is sorted to ensure the lower value is mentioned first.
	getBounds(axis) {
		return ['start', 'end'].map(label => this[label].getCoordinate(axis)).sort((a, b) => a - b)
	}

	// bounds gives an array of bounds along each axis, with the minimum and the maximum value in a form [[xmin, xmax], [ymin, ymax], ...].
	get bounds() {
		return numberArray(0, this.dimension - 1).map(axis => this.getBounds(axis))
	}

	// getSize gives the size of this rectangle along a certain axis.
	getSize(axis) {
		const bound = this.getBounds(axis)
		return bound[1] - bound[0]
	}

	// size gives an array of sizes along each axis.
	get size() {
		return numberArray(0, this.dimension - 1).map(axis => this.getSize(axis))
	}

	/*
	 * Manipulation and calculation methods.
	 */

	// transform applies the given transformation.
	transform(transformation, ...args) {
		return new Rectangle(this.positionedVector.transform(transformation, ...args))
	}

	// isInside checks if a vector (a point) falls within the rectangle.
	isInside(vector) {
		vector = ensureVector(vector, this.dimension)
		return numberArray(0, this.dimension - 1).every(axis => {
			const vectorCoordinate = vector.getCoordinate(axis)
			const [min, max] = this.getBounds(axis)
			return vectorCoordinate >= min && vectorCoordinate <= max
		})
	}

	// applyBounds will make sure that a given vector falls within the rectangle. It returns a new vector that is guaranteed to lie within the rectangle. If a coordinate falls outside of the range, it is brought inside.
	applyBounds(vector) {
		vector = ensureVector(vector, this.dimension)
		return new Vector(vector.coordinates.map((coordinate, axis) => boundTo(coordinate, ...this.getBounds(axis))))
	}

	// putOnNearestBound will take a given vector and return the closest point on the rectangle edge. This differs from applyBounds because, if the point is inside the rectangle, this function does return something different. On a tie, the smallest coordinate is chosen.
	putOnNearestBound(vector) {
		vector = ensureVector(vector, this.dimension)
		return new Vector(vector.coordinates.map((coordinate, axis) => {
			const [min, max] = this.getBounds(axis)
			return (Math.abs(coordinate - min) <= Math.abs(coordinate - max)) ? min : max
		}))
	}

	// getDistanceTo returns the distance of a point to this rectangle. A point inside the rectangle always has distance zero, unless toBounds is set to true, in which case the distance to the nearest bound is taken.
	getDistanceTo(vector, toBounds = false) {
		return this[toBounds ? 'putOnNearestBound' : 'applyBounds'](vector).subtract(vector).magnitude
	}

	// getLinePartFactors takes a line. It checks wich part of the line is within the rectangle. For this, it gives the lower and upper factor of the points on the line. If the line does not fall within the rectangle, undefined is returned.
	getLinePartFactors(line) {
		line = ensureLine(line, this.dimension)

		// Get the minimum and maximum factor of all the intersection points of the line with the box.
		let lower, upper
		repeat(this.dimension, axis => {
			// Special case: if the line is parallel to this axis, check if the given coordinate falls within the rectangle.
			if (compareNumbers(line.direction.getCoordinate(axis), 0)) {
				const coordinate = line.start.getCoordinate(axis)
				const bounds = this.getBounds(axis)
				if (coordinate < bounds[0] || coordinate > bounds[1]) {
					lower = Infinity
					upper = -Infinity
				}
				return
			}

			// Find the factors of the points at which the line intersects with the given coordinates.
			const factors = ['start', 'end'].map(label => line.getFactorOfPointWithCoordinate(axis, this[label].getCoordinate(axis))).sort((a, b) => a - b)

			// Update the minimum and maximum factor when appropriate.
			if (lower === undefined || factors[0] > lower)
				lower = factors[0]
			if (upper === undefined || factors[1] < upper)
				upper = factors[1]
		})

		// Check if the lower and upper limits are still sensible.
		if (upper < lower)
			return undefined
		return [lower, upper]
	}

	// getLinePart takes a line. It considers the current (this) PositionedVector as a rectangle (with start and end as corners, diagonally across) and checks which part of the line is inside the rectangle. It returns that part as a PositionedVector. It returns null on a line that's outside the given rectangle.
	getLinePart(line) {
		const linePartFactors = this.getLinePartFactors(line)
		return linePartFactors && new PositionedVector({
			start: line.getPointWithFactor(linePartFactors[0]),
			end: line.getPointWithFactor(linePartFactors[1]),
		})
	}

	// touchesPositionedVector checks if a part of the positionedVector falls within or touches this rectangle.
	touchesPositionedVector(positionedVector, contains = false) {
		// Examine the line through the positioned vector. If it doesn't go through the rectangle, return false.
		const linePartFactors = this.getLinePartFactors(positionedVector.line)
		if (!linePartFactors)
			return false

		// Check which part of the line falls within the rectangle.
		const [lower, upper] = linePartFactors
		return contains ?
			(lower >= 0 && upper <= 1) :
			(lower <= 1 && upper >= 0)
	}

	// touchesCircle checks if a part of the given circle falls within or touches this rectangle.
	touchesCircle(center, radius, contains = false) {
		center = ensureVector(center, this.dimension)
		radius = ensureNumber(radius, true)
		return contains ?
			this.isInside(center) && this.getDistanceTo(center, true) >= radius :
			this.getDistanceTo(center) <= radius
	}

	/*
	 * Comparison methods.
	 */

	// equals runs an exact equality check on the full set-up.
	equals(rectangle) {
		rectangle = ensureRectangle(rectangle)
		return this.positionedVector.equals(rectangle.positionedVector)
	}

	/*
	 * Static methods.
	 */

	// None yet.
}
Rectangle.type = 'Rectangle'
module.exports.Rectangle = Rectangle

// ensureRectangle ensures that the given parameter is a Rectangle object.
function ensureRectangle(rectangle) {
	return new Rectangle(rectangle)
}
module.exports.ensureRectangle = ensureRectangle