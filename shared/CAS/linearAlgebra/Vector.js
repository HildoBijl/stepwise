const { ensureNumber } = require('../../util/numbers')

class Vector {
	/*
	 * Creation methods.
	 */

	constructor(...args) {
		// Allow array inputs too.
		if (args.length === 1 && Array.isArray(args[0]))
			args = args[0]

		// Check and store the input.
		this.args = args.map(value => ensureNumber(value))
	}

	/*
	 * Getting and setting coordinates.
	 */

	get x() {
		return this.args[0]
	}
	get y() {
		return this.args[1]
	}
	get z() {
		return this.args[2]
	}

	set x(x) {
		this.setCoordinate(0, x)
	}
	set y(y) {
		this.setCoordinate(1, y)
	}
	set z(z) {
		this.setCoordinate(2, z)
	}

	getCoordinate(index) {
		return this.args[this.ensureValidIndex(index)]
	}
	setCoordinate(index, value) {
		this.args[this.ensureValidIndex(index)] = ensureNumber(value)
	}

	ensureValidIndex(index) {
		index = ensureNumber(index)
		if (index < 0)
			throw new Error(`Invalid vector index: the index cannot be negative. However, ${index} was received.`)
		if (index >= this.dimension)
			throw new Error(`Invalid vector index: the index cannot be larger than the vector dimension. However, ${index} was received for a vector of dimension ${this.dimension}.`)
		return index
	}

	/*
	 * Derived properties.
	 */

	get dimension() {
		return this.args.length
	}

	get squaredMagnitude() {
		return this.args.reduce((sum, coordinate) => sum + coordinate ** 2, 0)
	}

	get magnitude() {
		return Math.sqrt(this.squaredMagnitude)
	}

	/*
	 * Manipulation methods.
	 */

	reverse() {
		return new Vector(this.args.map(value => -value))
	}

	add(vector) {
		vector = ensureVector(vector, this.dimension)
		return new Vector(this.args.map((value, index) => value + vector.getCoordinate(index)))
	}

	subtract(vector) {
		return this.add(vector.reverse())
	}

	dotProduct(vector) {
		vector = ensureVector(vector)
		if (vector.dimension !== this.dimension)
			throw new Error(`Invalid vector: tried to take the dot product between a vector of dimension "${this.dimension}" and one of dimension "${vector.dimension}". This cannot be calculated.`)
		return this.args.reduce((sum, value, index) => sum + value * vector.getCoordinate(index), 0)
	}
}
module.exports.Vector = Vector

function ensureVector(vector, dimension) {
	if (!(vector instanceof Vector))
		throw new Error(`Invalid vector: expected a vector but received an object of type "${typeof vector}".`)
	if (dimension !== undefined && vector.dimension !== dimension)
		throw new Error(`Invalid vector dimension: expected a vector of dimension ${dimension} but received a vector of dimension ${vector.dimension}.`)
	return vector
}
module.exports.ensureVector = ensureVector