// A Transformation represents a linear manipulation of a vector. It consists of a transformation matrix M and a shift vector v. When applied, a vector x will be replaced by M*x+v. Note that the shift is applied AFTER the transformation matrix.

const { ensureInt, ensureNumber } = require('../util/numbers')
const { ensureNumberArray } = require('../util/arrays')
const { isBasicObject } = require('../util/objects')

const { ensureVector } = require('./Vector')
const { ensureMatrix } = require('./Matrix')

class Transformation {
	/*
	 * Creation methods.
	 */

	constructor(...args) {
		// If there is only one argument, it could be an SO or just a matrix.
		let matrix, vector
		if (args.length === 1) {
			if (isBasicObject(args[0])) {
				matrix = args[0].matrix
				vector = args[0].vector
			} else {
				matrix = args[0]
			}
		}

		// Check and store the input.
		this.matrix = ensureMatrix(matrix, { square: true })
		this.vector = vector === undefined ? Vector.getZero(matrix.height) : ensureVector(vector, matrix.height)
	}

	get SO() {
		return { matrix: this.matrix.SO, vector: this.vector.SO }
	}

	get type() {
		return this.constructor.type
	}

	/*
	 * Derived properties.
	 */

	get dimension() {
		return this.matrix.height
	}

	get determinant() {
		return this.matrix.determinant
	}

	isInvertible() {
		return this.matrix.isInvertible()
	}

	get inverse() {
		const matrix = this.matrix.inverse
		const vector = matrix.multiply(this.vector).multiply(-1)
		return new Transformation(matrix, vector)
	}

	get str() {
		return this.toString()
	}

	toString() {
		return `{ matrix: ${this.matrix.str}, vector: ${this.vector.str} }`
	}

	isIdentity() {
		return this.matrix.isIdentity()
	}

	/*
	 * Manipulation methods.
	 */

	// chain will give the transformation that results from applying this transformation FOLLOWED by the given transformation.
	chain(secondTransformation) {
		secondTransformation = ensureTransformation(secondTransformation, this.dimension)
		const matrix = secondTransformation.matrix.multiply(this.matrix)
		const vector = secondTransformation.matrix.multiply(this.vector).add(secondTransformation.vector)
		return new Transformation(matrix, vector)
	}

	apply(vector, relativeTo) {
		vector = ensureVector(vector, this.dimension)

		// Determine which transformation to use.
		const transformation = relativeTo ? this.getRelativeTo(relativeTo) : this

		// Apply the transformation.
		return transformation.matrix.multiply(vector).add(transformation.vector)
	}

	// getRelativeTo returns a new transformation that is the current transformation but then relative to the given vector. So for instance, suppose that the current transformation is rotation around the origin. If we ask for a rotation relative to (2,3), then the rotation will be done around this given point (2,3).
	getRelativeTo(relativeTo = Vector.getZero(this.dimension)) {
		relativeTo = ensureVector(relativeTo, this.dimension)
		const vector = this.vector.add(relativeTo).subtract(this.matrix.multiply(relativeTo))
		return new Transformation(this.matrix, vector)
	}

	/*
	 * Static methods.
	 */

	static getIdentity(dimension) {
		return new Transformation(Matrix.getIdentity(dimension), Vector.getZero(dimension))
	}

	// getShift returns a transformation that only shifts by a given vector.
	static getShift(vector) {
		vector = ensureVector(vector)
		const matrix = Matrix.getIdentity(vector.dimension)
		return new Transformation(matrix, vector)
	}

	// getScale returns a transformation that scales by a given factor per dimension. The scales parameter must be an array denoting the 
	static getScale(scales, relativeTo) {
		scales = ensureNumberArray(scales)
		const matrix = Matrix.getDiagonal(scales)
		const vector = Vector.getZero(scales.length)
		return new Transformation(matrix, vector).getRelativeTo(relativeTo)
	}

	static getUniformScale(scale, dimension, relativeTo) {
		dimension = ensureInt(dimension, true)
		const scales = numberArray(0, dimension - 1).map(_ => scale)
		return Transformation.getScale(scales, relativeTo)
	}

	// getRotation returns a 2D transformation that rotates by a given angle around the origin or around the given point.
	static getRotation(rotation, relativeTo) {
		rotation = ensureNumber(rotation)
		const matrix = [
			[Math.cos(rotation), -Math.sin(rotation)],
			[Math.sin(rotation), Math.cos(rotation)],
		]
		const vector = Vector.getZero(2)
		return new Transformation(matrix, vector).getRelativeTo(relativeTo)
	}

	// getReflection returns a transformation that will reflect a point along the given direction. Yes, ALONG. So to flip across the vertical axis, reflect ALONG the horizontal axis, and hence give [1, 0] as vector. This also works for higher dimensions. By default, reflection is done along the x-axis.
	static getReflection(direction, relativeTo) {
		if (direction === undefined)
			direction = Vector.getUnitVector(0, this.dimension)
		direction = ensureVector(direction, this.dimension, undefined, true)

		// Apply the respective transformation matrix I - 2*v*v^T/|v|^2.
		direction = direction.normalize()
		const matrix = direction.coordinates.map((rowElement, rowIndex) => direction.coordinates.map((colElement, colIndex) => (rowIndex === colIndex ? 1 : 0) - 2 * rowElement * colElement))
		const vector = Vector.getZero(direction.dimension)
		return new Transformation(matrix, vector).getRelativeTo(relativeTo)
	}
}
Transformation.type = 'Transformation'
module.exports.Transformation = Transformation

// ensureTransformation takes an object and ensures it's a Transformation.
function ensureTransformation(transformation, dimension, requireInvertible = false) {
	// Ensure that we have a Transformation.
	transformation = new Transformation(transformation)

	// If a required dimension is specified, check this.
	if (dimension !== undefined && transformation.dimension !== dimension)
		throw new Error(`Invalid Transformation dimension: expected a transformation of dimension ${dimension} but received a transformation of dimension ${transformation.dimension}.`)

	// Check for invertibility.
	if (requireInvertible && !transformation.isInvertible())
		throw new Error(`Invalid Transformation: required an invertible transformation, but received on that was not invertible.`)

	// All in order.
	return transformation
}
module.exports.ensureTransformation = ensureTransformation
