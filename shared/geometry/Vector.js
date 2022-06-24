// A Vector is a combination of coordinates. It can be entered as an array [2, 3, 4] or an object { x: 2, y: 3, z: 4 }. It can be of any dimension. Various methods like the magnitude are available.

const { ensureInt, ensureNumber, isNumber, compareNumbers } = require('../util/numbers')

class Vector {
	/*
	 * Creation methods.
	 */

	constructor(...args) {
		// Check for empty input.
		if (args.length === 0)
			throw new Error(`Invalid Vector: the Vector constructor was called without input. For the zero vector, use Vector.zero or Vector['3D'].zero.`)

		// Check if the sole input is an array. In that case, examine that array.
		if (args.length === 1 && Array.isArray(args[0]))
			args = args[0]

		// On an array of numbers, process the numbers.
		if (args.length > 1 || isNumber(args[0])) {
			this.coordinates = args.map(value => ensureNumber(value))
			return
		}

		// On an object, try to process it.
		const vector = args[0]
		if (typeof vector !== 'object')
			throw new Error(`Invalid Vector: expected an array of coordinates or some other Vector-like object but received something of type "${vector}".`)
		if (vector instanceof Vector)
			return vector
		return Vector.fromCoordinates(vector)
	}

	get SO() {
		return this.coordinates
	}

	get type() {
		return this.constructor.type
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

	get unitVector() {
		return this.normalize()
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

	isZero() {
		return compareNumbers(this.squaredMagnitude, 0)
	}

	/*
	 * Manipulation methods.
	 */

	reverse() {
		return this.multiply(-1)
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

	// divide will divide the vector by a scalar.
	divide(number) {
		number = ensureNumber(number)
		return this.multiply(1 / number)
	}

	// interpolate will take a vector and interpolate between the vectors. 0 means this vector is kept and 1 means the other vector is used. Default is 0.5.
	interpolate(vector, factor = 0.5) {
		vector = ensureVector(vector, this.dimension)
		return this.multiply(1 - factor).add(vector.multiply(factor))
	}

	// normalize will return the unit vector in the given direction, effectively normalizing the vector.
	normalize() {
		return this.setMagnitude(1)
	}

	setMagnitude(magnitude) {
		magnitude = ensureNumber(magnitude)
		const ownMagnitude = this.magnitude
		if (compareNumbers(magnitude, 0))
			throw new Error(`Invalid setMagnitude call: cannot set the magnitude of the zero vector.`)
		return this.multiply(magnitude / ownMagnitude)
	}

	// round will take all coordinates and round them to the nearest integer.
	round() {
		return new Vector(this.coordinates.map(value => Math.round(value)))
	}

	// shorten will shorten the vector by a set amount while keeping its direction. If the distance is larger than the magnitude of this vector, the zero vector (of same dimension) is returned.
	shorten(distance) {
		distance = ensureNumber(distance)
		return this.multiply(Math.max(0, 1 - distance / this.magnitude))
	}

	// dotProduct gives the dot product between this vector and another.
	dotProduct(vector) {
		vector = ensureVector(vector)
		if (vector.dimension !== this.dimension)
			throw new Error(`Invalid vector: tried to take the dot product between a vector of dimension "${this.dimension}" and one of dimension "${vector.dimension}". This cannot be calculated.`)
		return this.coordinates.reduce((sum, value, index) => sum + value * vector.getCoordinate(index), 0)
	}

	// distanceTo gives the distance to a given point.
	distanceTo(vector) {
		return Math.sqrt(this.squaredDistanceTo(vector))
	}

	// squaredDistanceTo gives the squared distance to a given point.
	squaredDistanceTo(vector) {
		vector = ensureVector(vector, this.dimension)
		return this.subtract(vector).squaredMagnitude
	}

	// getProjectionOn gets the component of a given vector along another given vector: its projection onto this vector.
	getProjectionOn(vector) {
		return vector.multiply(this.dotProduct(vector) / vector.squaredMagnitude)
	}

	// getPerpendicularComponent gets the perpendicular component of the given vector with respect to another vector. 
	getPerpendicularComponent(vector) {
		return this.subtract(this.getProjectionOn(vector))
	}

	/*
	 * Transformation methods.
	 */

	// transform applies a transformation matrix (an array of arrays, like [[1,0],[0,1]]) to a vector. This transformation is done as seen from the given vector position (default the zero position). 
	transform(matrix, relativeTo) {
		// Check the input.
		if (!Array.isArray(matrix) || matrix.length !== this.dimension || matrix.some(row => !Array.isArray(row) || row.length !== this.dimension || row.some(element => !isNumber(element))))
			throw new Error(`Invalid transformation matrix: did not receive a matrix (an array with row arrays) of size ${this.dimension}. Instead, received "${matrix}".`)
		relativeTo = ensureVector(relativeTo, this.dimension, true)

		// Apply the matrix to the vector.
		const relativeVector = this.subtract(relativeTo)
		const transformedVector = new Vector(matrix.map(row => relativeVector.dotProduct(new Vector(row))))
		return relativeTo.add(transformedVector)
	}

	// scale will scale the point according to the given scales. When a single number is given, this is just like multiply. When an array of numbers is given, with equal length as the dimension, then a different scale can be applied to each dimension.
	scale(scales, relativeTo) {
		// Check the input.
		if (!Array.isArray(scales))
			scales = this.coordinates.map(_ => scales)
		scales = scales.map(scale => ensureNumber(scale))

		// Apply the respective transformation matrix.
		const matrix = scales.map((scale, rowIndex) => scales.map((_, colIndex) => rowIndex === colIndex ? scale : 0))
		return this.transform(matrix, relativeTo)
	}

	// rotate will rotate the point according to the given angle. When an extra vector is given, the rotation is done according to the given point. This only works in 2D.
	rotate(rotation, relativeTo) {
		// Check the input and situation.
		if (this.dimension !== 2)
			throw new Error(`Invalid rotate call: tried to rotate a ${this.dimension}D vector, but rotation is only possible in 2D.`)
		rotation = ensureNumber(rotation)

		// Apply the respective transformation matrix.
		const matrix = [
			[Math.cos(rotation), -Math.sin(rotation)],
			[Math.sin(rotation), Math.cos(rotation)],
		]
		return this.transform(matrix, relativeTo)
	}

	// reflect will reflect a point along the given direction. Yes, ALONG. So to flip across the vertical axis, reflect ALONG the horizontal axis, and hence give [1, 0] as vector. This function also works for higher dimensions. By default, reflection is done along the x-axis.
	reflect(direction, relativeTo) {
		// Check the input.
		if (direction === undefined)
			direction = Vector.getUnitVector(0, this.dimension)
		direction = ensureVector(direction, this.dimension, undefined, true)

		// Apply the respective transformation matrix I - 2*v*v^T/|v|^2.
		direction = direction.normalize()
		const matrix = direction.coordinates.map((rowElement, rowIndex) => direction.coordinates.map((colElement, colIndex) => (rowIndex === colIndex ? 1 : 0) - 2 * rowElement * colElement))
		return this.transform(matrix, relativeTo)
	}

	/*
	 * Comparison methods.
	 */

	// equals runs an exact equality check on two vectors.
	equals(vector) {
		return vector instanceof Vector && this.dimension === vector.dimension && this.coordinates.every((value, index) => compareNumbers(value, vector.getCoordinate(index)))
	}

	// isEqualMagnitude checks if two vectors have equal magnitude.
	isEqualMagnitude(vector) {
		vector = ensureVector(vector, this.dimension)
		return compareNumbers(this.squaredMagnitude, vector.squaredMagnitude)
	}

	/*
	 * Static methods.
	 */

	// getZero returns the zero vector for the given dimension.
	static getZero(dimension) {
		dimension = ensureInt(dimension, true)
		return new Vector(new Array(dimension).fill(0))
	}

	// getUnitVector returns the unit vector along the given axis (0 for x, 1 for y, etcetera) for the given dimension.
	static getUnitVector(axis, dimension) {
		axis = ensureInt(axis, true)
		dimension = ensureInt(dimension, true)
		if (axis >= dimension)
			throw new Error(`Invalid axis: cannot have an axis (${axis}) equal to or larger than the dimension (${dimension}).`)

		// Assemble the unit vector.
		const coordinates = new Array(dimension).fill(0)
		coordinates[axis] = 1
		return new Vector(coordinates)
	}

	// fromCoordinates allows for an object like { x: 2, y: 4 } and possibly with z too to be turned into a Vector.
	static fromCoordinates(coordinates) {
		if (typeof coordinates !== 'object')
			throw new Error(`Invalid coordinates: expected an object with coordinates but received an input of type "${coordinates}".`)

		// Check how many parameters there are.
		const parameters = ['x', 'y', 'z']
		const parameterCount = parameters.findIndex(parameter => coordinates[parameter] === undefined)
		if (parameterCount === 0)
			throw new Error(`Invalid coordinates: expected an object with coordinates "x", "y", ... but the x-parameter is already missing.`)
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
Vector.type = 'Vector'
Vector.zero = new Vector(0, 0)
Vector.i = new Vector(1, 0)
Vector.j = new Vector(0, 1)
Vector['3D'] = {
	zero: new Vector(0, 0, 0),
	i: new Vector(1, 0, 0),
	j: new Vector(0, 1, 0),
	k: new Vector(0, 0, 1),
}
module.exports.Vector = Vector

// ensureVector takes an object and ensures it's a vector. If the dimension is given, it also ensures it's a vector of the given dimension. Possibly the vector may be a plain object like {x: 2, y: 3} in which case this function tries to turn it into a vector object.
function ensureVector(vector, dimension, useDefaultZero = false, preventZero = false) {
	// Check the settings.
	if (useDefaultZero && preventZero)
		throw new Error(`Invalid ensureVector settings: you have set "useDefaultZero" to true but "preventZero" also to true. That's a contradiction in itself.`)

	// Check if the vector is undefined and we need to use zero as default.
	if (useDefaultZero && vector === undefined)
		return Vector.getZero(dimension)

	// Ensure that we have a Vector.
	vector = new Vector(vector)

	// If a required dimension is specified, check this.
	if (dimension !== undefined && vector.dimension !== dimension)
		throw new Error(`Invalid Vector dimension: expected a vector of dimension ${dimension} but received a vector of dimension ${vector.dimension}.`)

	// Check for zero.
	if (preventZero && vector.isZero())
		throw new Error(`Invalid Vector: received a zero vector (dimension ${this.dimension}) but this is not allowed.`)

	// All in order.
	return vector
}
module.exports.ensureVector = ensureVector

// ensureVectorArray ensures that we have an array of vectors. It turns the result into vectors if they're not vectors yet, like an array of coordinates [200, 300] or an object { x: 200, y: 300 }.
function ensureVectorArray(vectors, dimension) {
	if (!Array.isArray(vectors))
		throw new Error(`Invalid Vector array: expected an array of vectors or vector-like objects (arrays or objects with coordinates) but received a parameter of type "${typeof vectors}".`)
	return vectors.map(vector => ensureVector(vector, dimension))
}
module.exports.ensureVectorArray = ensureVectorArray
