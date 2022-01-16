const { ensureNumber } = require('../../util/numbers')
const { processOptions } = require('../../util/objects')

class Vector {
	/*
	 * Creation methods.
	 */

	constructor(...args) {
		// Allow array inputs too.
		if (args.length === 1 && Array.isArray(args[0]))
			args = args[0]

		// Check and store the input.
		this.coordinates = args.map(value => ensureNumber(value))
	}

	/*
	 * Getting and setting coordinates.
	 */

	get x() {
		return this.coordinates[0]
	}
	get y() {
		return this.coordinates[1]
	}
	get z() {
		return this.coordinates[2]
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
		return this.coordinates[this.ensureValidIndex(index)]
	}
	setCoordinate(index, value) {
		this.coordinates[this.ensureValidIndex(index)] = ensureNumber(value)
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
		return this.coordinates.length
	}

	get squaredMagnitude() {
		return this.coordinates.reduce((sum, coordinate) => sum + coordinate ** 2, 0)
	}

	get magnitude() {
		return Math.sqrt(this.squaredMagnitude)
	}

	// argument gives the argument of a 2D vector (and 2D only) in radians, measured counterclockwise from the rightmost point.
	get argument() {
		if (this.dimension !== 2)
			throw new Error(`Invalid argument call: cannot calculate the argument of a ${this.dimension}D vector.`)
		return Math.atan2(this.y, this.x)
	}

	get str() {
		return this.toString()
	}

	toString() {
		return `[${this.coordinates.join(', ')}]`
	}

	/*
	 * Manipulation methods.
	 */

	reverse() {
		return new Vector(this.coordinates.map(value => -value))
	}

	add(vector) {
		vector = ensureVector(vector, this.dimension)
		return new Vector(this.coordinates.map((value, index) => value + vector.getCoordinate(index)))
	}

	subtract(vector) {
		return this.add(vector.reverse())
	}

	// multiply will multiply the vector by a scalar, scaling it up.
	multiply(number) {
		number = ensureNumber(number)
		return new Vector(this.coordinates.map(value => value * number))
	}

	// shorten will shorten the vector by a set amount while keeping its direction. If the distance is larger than the magnitude of this vector, the zero vector (of same dimension) is returned.
	shorten(distance) {
		distance = ensureNumber(distance)
		return this.multiply(Math.max(0, 1 - distance / this.magnitude))
	}

	dotProduct(vector) {
		vector = ensureVector(vector)
		if (vector.dimension !== this.dimension)
			throw new Error(`Invalid vector: tried to take the dot product between a vector of dimension "${this.dimension}" and one of dimension "${vector.dimension}". This cannot be calculated.`)
		return this.coordinates.reduce((sum, value, index) => sum + value * vector.getCoordinate(index), 0)
	}

	/*
	 * Comparison methods.
	 */
	equals(vector) {
		return this.dimension === vector.dimension && this.coordinates.every((value, index) => value === vector.getCoordinate(index))
	}

	/*
	 * Static methods.
	 */

	// fromCoordinates allows for an object like { x: 2, y: 4 } and possibly with z too.
	static fromCoordinates(coordinates) {
		if (typeof coordinates !== 'object')
			throw new Error(`Invalid coordinates: expected an object with coordinates but received an input of type "${coordinates}".`)

		// Check how many parameters there are.
		const parameters = ['x', 'y', 'z']
		const parameterCount = parameters.findIndex(parameter => coordinates[parameter] === undefined)
		if (parameterCount === -1)
			parameterCount = parameters.length
		if (Object.keys(coordinates).length !== parameterCount)
			throw new Error(`Invalid coordinates: expected an object with only coordinates "x", "y", ... but recieved an object with more parameters. Please insert only clean coordinates objects.`)

		// Process the parameters and turn them into a vector.
		const parametersUsed = parameters.slice(0, parameterCount)
		const coordinatesAsVector = parametersUsed.map(parameter => ensureNumber(coordinates[parameter]))
		return new Vector(coordinatesAsVector)
	}

	// fromPolar takes a magnitude and argument and gives a 2D vector.
	static fromPolar(magnitude, argument) {
		// Check input.
		magnitude = ensureNumber(magnitude)
		argument = ensureNumber(argument)

		// Set up a new vector.
		return Vector.fromCoordinates({
			x: magnitude * Math.cos(argument),
			y: magnitude * Math.sin(argument),
		})
	}
}
module.exports.Vector = Vector

// ensureVector takes an object and ensures it's a vector. If the dimension is given, it also ensures it's a vector of the given dimension. Possibly the vector may be a plain object like {x: 2, y: 3} in which case this function tries to turn it into a vector object.
function ensureVector(vector, dimension) {
	// If it is not a vector, try to turn it into one.
	if (!(vector instanceof Vector)) {
		if (Array.isArray(vector))
			vector = new Vector(vector)
		else if (typeof vector === 'object' && vector.x !== undefined)
			vector = Vector.fromCoordinates(vector)
		else
			throw new Error(`Invalid vector: expected a vector but received an object of type "${typeof vector}".`)
	}

	// If a required dimension is specified, check this.
	if (dimension !== undefined && vector.dimension !== dimension)
		throw new Error(`Invalid vector dimension: expected a vector of dimension ${dimension} but received a vector of dimension ${vector.dimension}.`)

	// All in order. Return the vector.
	return vector
}
module.exports.ensureVector = ensureVector

// ensureSVE ensures that a parameter is an object with a start, vector and end property. At least two of the three must be given and the third is then automatically determined. The result is returned.
function ensureSVE(sve) {
	sve = processOptions(sve, defaultSVE)
	let start, vector, end
	if (!sve.end) {
		start = ensureVector(sve.start, 2)
		vector = ensureVector(sve.vector, 2)
		end = start.add(vector)
	} else if (!sve.start) {
		end = ensureVector(sve.end, 2)
		vector = ensureVector(sve.vector, 2)
		start = end.subtract(vector)
	} else {
		start = ensureVector(sve.start, 2)
		end = ensureVector(sve.end, 2)
		vector = end.subtract(start)
		if (sve.vector && !vector.equals(sve.vector))
			throw new Error(`Invalid start-vector-end combination: the given vector "${sve.vector}" is not the difference between the start "${start}" and the end "${end}".`)
	}
	return { start, vector, end }
}
const defaultSVE = {
	start: undefined,
	vector: undefined,
	end: undefined,
}
module.exports.ensureSVE = ensureSVE