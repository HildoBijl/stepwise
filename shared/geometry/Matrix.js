// A Matrix is an array of number arrays, like [[1,2],[3,4],[5,6]]. It can be manipulated, multiplied, etcetera in a multitude of ways.

const { ensureInt, ensureNumber, isNumber, compareNumbers } = require('../util/numbers')
const { numberArray, ensureNumberArray } = require('../util/arrays')
const { processOptions } = require('../util/objects')
const { ensureFunction } = require('../util/functions')

const { Vector } = require('./Vector')

class Matrix {
	/*
	 * Creation methods.
	 */

	constructor(matrix) {
		// Check if the matrix is already a Matrix.
		if (matrix instanceof Matrix)
			return matrix

		// Ensure that the input is a valid matrix of numbers.
		if (!Array.isArray(matrix))
			throw new Error(`Invalid Matrix: expected an array of arrays, but received something of type "${typeof matrix}".`)
		matrix = matrix.map((row, rowIndex) => {
			if (!Array.isArray(row))
				throw new Error(`Invalid Matrix: expected an array of arrays, but row ${rowIndex} was not an array.`)
			if (rowIndex > 0 && row.length !== matrix[0].length)
				throw new Error(`Invalid Matrix: expected each row of the matrix to be of equal length, but while row 0 has length ${matrix[0].length}, row ${rowIndex} has length ${row.length}.`)
			return row.map(element => ensureNumber(element))
		})

		// All in order! Store the matrix.
		this.matrix = matrix
	}

	get SO() {
		return this.matrix
	}

	get type() {
		return this.constructor.type
	}

	/*
	 * Getting and setting coordinates.
	 */

	get(rowIndex, colIndex) {
		return this.matrix[rowIndex][colIndex]
	}
	getRow(rowIndex) {
		return this.matrix[rowIndex]
	}
	getColumn(colIndex) {
		return this.matrix.map(row => row[colIndex])
	}

	set(rowIndex, colIndex, value) {
		// Check input.
		rowIndex = this.ensureValidRowIndex(rowIndex)
		colIndex = this.ensureValidColIndex(colIndex)
		value = ensureNumber(value)

		// Copy the matrix shallowly and adjust the value.
		this.matrix = this.matrix.map((row, currRowIndex) => {
			return rowIndex === currRowIndex ? row.map((currValue, currColIndex) => colIndex === currColIndex ? value : currValue) : row
		})
	}
	setRow(rowIndex, row) {
		// Check input.
		rowIndex = this.ensureValidRowIndex(rowIndex)
		row = row.map(value => ensureNumber(value))

		// Copy the matrix shallowly and adjust the row.
		this.matrix = this.matrix.map((currRow, currRowIndex) => {
			return rowIndex === currRowIndex ? row : currRow
		})
	}
	setCol(colIndex, col) {
		// Check input.
		colIndex = this.ensureValidRowIndex(colIndex)
		col = col.map(value => ensureNumber(value))

		// Copy the matrix shallowly and adjust the column.
		this.matrix = this.matrix.map((currRow, currRowIndex) => {
			return currRow.map((value, currColIndex) => colIndex === currColIndex ? col[currRowIndex] : value)
		})
	}

	/*
	 * Input checking functions.
	 */

	ensureValidRowIndex(rowIndex) {
		rowIndex = ensureInt(rowIndex)
		if (rowIndex < 0 || rowIndex >= this.numRows)
			throw new Error(`Invalid row index: a row index of ${rowIndex} was given, but the matrix only has ${this.numRows} rows.`)
		return rowIndex
	}

	ensureValidColIndex(colIndex) {
		colIndex = ensureInt(colIndex)
		if (colIndex < 0 || colIndex >= this.numCols)
			throw new Error(`Invalid column index: a column index of ${colIndex} was given, but the matrix only has ${this.numCols} column.`)
		return colIndex
	}

	ensureSameSizeMatrix(matrix) {
		return ensureMatrix(matrix, { width: this.width, height: this.height })
	}

	/*
	 * Derived properties.
	 */

	get height() {
		return this.matrix.length
	}
	get width() {
		return this.matrix[0].length
	}
	get numRows() {
		return this.height
	}
	get numCols() {
		return this.width
	}
	isSquare() {
		return this.height === this.width
	}

	get determinant() {
		// Check edge cases.
		if (!this.isSquare())
			throw new Error(`Invalid determinant request: cannot get the determinant of a non-square matrix. The matrix used is ${this.height} by ${this.width}.`)

		// Check a unity case.
		if (this.height === 1)
			return this.get(0, 0)

		// Calculate the determinant.
		return this.matrix.reduce((D, row, rowIndex) => D + row[0] * this.getSubMatrix(rowIndex, 0).determinant * (rowIndex % 2 === 0 ? 1 : -1), 0)
	}

	// getSubMatrix returns a matrix without the given row and column.
	getSubMatrix(rowIndex, colIndex) {
		// Check input.
		rowIndex = this.ensureValidRowIndex(rowIndex)
		colIndex = this.ensureValidColIndex(colIndex)

		// Assemble the subMatrix.
		return new Matrix(numberArray(0, this.height - 2).map(currRowIndex => {
			currRowIndex += (currRowIndex < rowIndex ? 0 : 1)
			return numberArray(0, this.width - 2).map(currColIndex => {
				currColIndex += (currColIndex < colIndex ? 0 : 1)
				return this.get(currRowIndex, currColIndex)
			})
		}))
	}

	isInvertible() {
		return !compareNumbers(this.determinant, 0)
	}

	get adjoint() {
		return this.map((_, rowIndex, colIndex) => this.getSubMatrix(rowIndex, colIndex).determinant * ((rowIndex + colIndex) % 2 === 0 ? 1 : -1)).transpose
	}

	// The inverse calculates the inverse of the matrix. It is strongly recommended to first check manually if the matrix is invertible before calculating the inverse. This function does not check itself whether it's invertible.
	get inverse() {
		return this.adjoint.divide(this.determinant)
	}

	get str() {
		return this.toString()
	}

	toString() {
		return `[[${this.matrix.map(row => row.join(', ')).join('], [')}]]`
	}

	isZero() {
		return this.every(value => compareNumbers(value, 0))
	}

	isIdentity() {
		return this.every((value, rowIndex, colIndex) => compareNumbers(value, rowIndex === colIndex ? 1 : 0))
	}

	/*
	 * Array-like manipulation methods.
	 */

	// map is like the array map: it applies the given function (value, rowIndex, colIndex) => { ... } to each element and returns the result as another matrix of equal size.
	map(func) {
		func = ensureFunction(func)
		return new Matrix(this.matrix.map((row, rowIndex) => row.map((value, colIndex) => func(value, rowIndex, colIndex))))
	}

	// mapRows is like the array map but then applied to rows.
	mapRows(func) {
		return this.matrix.map((row, rowIndex) => func(row, rowIndex))
	}

	// mapColumns is like the array map but then applied to columns.
	mapColumns(func) {
		return numberArray(0, this.width - 1).map(colIndex => func(this.getColumn(colIndex), colIndex))
	}

	// forEach is like the array forEach: it applies the given function (value, rowIndex, colIndex) to each element.
	forEach(func) {
		this.map(func) // No return value.
	}

	// reduce is like the array reduce: it applies the given function (value, rowIndex, colIndex, reduction) => { ... } to each element and updates the reduction accordingly.
	reduce(func, initialValue = 0) {
		let reduction = initialValue
		this.forEach((value, rowIndex, colIndex) => {
			reduction = func(value, rowIndex, colIndex, reduction)
		})
	}

	// findIndex is like the array findIndex: it walks through the matrix (first the first row, then the second row, etcetera) until it finds an element returning something truthy for the given function. It returns an object { rowIndex, colIndex }. If nothing is found, undefined is returned.
	findIndex(func) {
		// Walk through the rows and columns.
		let rowIndex, colIndex
		rowIndex = this.matrix.findIndex((row, rowIndex) => {
			colIndex = row.findIndex((value, colIndex) => func(value, rowIndex, colIndex))
			if (colIndex !== -1)
				return true
		})

		// Check if something has been found.
		return (rowIndex === -1) ? undefined : { rowIndex, colIndex }
	}

	// find is like the array find: it walks through the matrix until it finds an element returning something truthy for the given function. The value is returned.
	find(func) {
		const index = this.findIndex(func)
		return index ? this.get(index.rowIndex, index.colIndex) : undefined
	}

	// every is like the array every: it checks if all elements satisfy the function.
	every(func) {
		return !this.findIndex((value, rowIndex, colIndex) => !func(value, rowIndex, colIndex))
	}

	// some is like the array some: it checks if some element satisfies the function.
	some(func) {
		return !!this.findIndex(func)
	}

	/*
	 * Manipulation methods.
	 */

	get transpose() {
		return new Matrix(numberArray(0, this.width - 1).map(colIndex => numberArray(0, this.height - 1).map(rowIndex => this.matrix[rowIndex][colIndex])))
	}

	add(matrix) {
		matrix = this.ensureSameSizeMatrix(matrix)
		return this.map((value, rowIndex, colIndex) => value + matrix.get(rowIndex, colIndex))
	}

	subtract(vector) {
		matrix = this.ensureSameSizeMatrix(matrix)
		return this.map((value, rowIndex, colIndex) => value - matrix.get(rowIndex, colIndex))
	}

	multiply(multiplication) {
		// Check input.
		if (!isNumber(multiplication) && !(multiplication instanceof Vector) && !(multiplication instanceof Matrix))
			throw new Error(`Invalid Matrix multiplication: expected a multiplication by a number (scalar), a Vector or a Matrix, but received something of type "${typeof multiplication}".`)

		// Apply scalar multiplication.
		if (isNumber(multiplication))
			return this.map(value => value * multiplication)

		// Apply vector Multiplication.
		if (multiplication instanceof Vector) {
			if (multiplication.dimension !== this.width)
				throw new Error(`Invalid Matrix multiplication: tried to multiply a matrix with width ${this.width} by a Vector of dimension ${multiplication.dimension}. These two numbers must be equal to compute the multiplication.`)
			return new Vector(this.mapRows(row => new Vector(row).dotProduct(multiplication)))
		}

		// Apply matrix multiplication.
		if (multiplication instanceof Matrix) {
			if (this.width !== multiplication.height)
				throw new Error(`Invalid Matrix multiplication: dimensions did not match. This matrix has width ${this.width} while the multiplied matrix has height ${this.height}.`)
			return new Matrix(this.mapRows(row => multiplication.mapColumns(col => new Vector(row).dotProduct(new Vector(col)))))
		}

		throw new Error(`Code error: reached a point in the code that should never be reached. There is a programming error.`)
	}

	// divide will divide the matrix by either a scalar or an invertible matrix of the right size.
	divide(division) {
		// Check input.
		if (!isNumber(division) && !(division instanceof Matrix))
			throw new Error(`Invalid Matrix division: expected a division by a number (scalar) or a Matrix, but received something of type "${typeof division}".`)

		// Apply scalar division.
		if (isNumber(division))
			return this.map(value => value / division)

		// Apply matrix division.
		return this.multiply(division.inverse)
	}

	/*
	 * Comparison methods.
	 */

	// equals runs an exact equality check on two matrices.
	equals(matrix) {
		return matrix instanceof Matrix && this.hasDimensions(matrix.height, matrix.width) && this.every((value, rowIndex, colIndex) => compareNumbers(value, matrix.get(rowIndex, colIndex)))
	}

	// hasDimensions checks if the matrix has the given height and width.
	hasDimensions(height, width) {
		return this.height === height && this.width === width
	}

	/*
	 * Static methods.
	 */

	// getZero returns the zero matrix for the given dimensions.
	static getZero(height, width = height) {
		height = ensureInt(height, true)
		width = ensureInt(width, true)
		return new Matrix(new Array(height).fill(new Array(width).fill(0)))
	}

	// getIdentity returns the identity vector for the given dimensions.
	static getIdentity(height, width = height) {
		return Matrix.getZero(height, width).map((_, rowIndex, colIndex) => (rowIndex === colIndex ? 1 : 0))
	}

	// getDiagonal returns the diagonal (square) matrix with the given numbers (an array) along its diagonal.
	static getDiagonal(diagonal) {
		diagonal = ensureNumberArray(diagonal)
		return Matrix.getZero(diagonal.length, diagonal.length).map((_, rowIndex, colIndex) => (rowIndex === colIndex ? diagonal[rowIndex] : 0))
	}
}
Matrix.type = 'Matrix'
module.exports.Matrix = Matrix

// ensureMatrix takes an object and ensures it's a matrix. If the dimensions are given, it also ensures it's a matrix of the given dimensions.
function ensureMatrix(matrix, requirements = {}) {
	requirements = processOptions(requirements, defaultMatrixRequirements)
	let { height, width } = requirements

	// If the matrix is undefined and this is allowed, return the identity matrix.
	if (!requirements.defined && matrix === undefined) {
		height = ensureInt(height, true)
		width = (width === undefined ? height : ensureInt(width, true))
		return Matrix.getIdentity(height, width)
	}

	// Ensure that we have a Matrix.
	matrix = new Matrix(matrix)

	// If dimensions are given, check that they are present.
	if (height !== undefined) {
		height = ensureInt(height, true)
		if (matrix.height !== height)
			throw new Error(`Invalid Matrix height: expected a matrix of height ${height} but received a matrix of dimensions ${matrix.height} by ${matrix.width}.`)
	}
	if (width !== undefined) {
		width = ensureInt(width, true)
		if (matrix.width !== width)
			throw new Error(`Invalid Matrix width: expected a matrix of width ${width} but received a matrix of dimensions ${matrix.height} by ${matrix.width}.`)
	}

	// Check for square matrices.
	if (requirements.square && !matrix.isSquare())
		throw new Error(`Invalid Matrix shape: expected a square matrix, but received a matrix of dimensions ${matrix.height} by ${matrix.width}.`)

	// Check for non-invertible matrices.
	if (requirements.invertible && !matrix.isInvertible())
		throw new Error(`Invalid Matrix: received a non-invertible matrix but an invertible matrix was required.`)

	// All in order.
	return matrix
}
module.exports.ensureMatrix = ensureMatrix
const defaultMatrixRequirements = {
	height: undefined,
	width: undefined,
	defined: true, // When set to false, the identity matrix will be used.
	square: false, // When set to true, the matrix must be square.
	invertible: false, // When set to true, the matrix must be invertible.
}
