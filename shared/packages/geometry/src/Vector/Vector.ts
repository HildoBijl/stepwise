import { ensureInt, ensureNumber, compareNumbers } from '@step-wise/utils'

import type { CoordinateList, VectorData, VectorInput } from './types'
import { isCoordinateList, isCoordinateObject, coordinatesFromObject } from './support'

export type { VectorData }
export type VectorLike = Vector | VectorInput

export class Vector {
	private _coordinates: CoordinateList
	
	/*
	 * Common vectors.
	 */

	static readonly zero = new Vector(0, 0)
	static readonly i = new Vector(1, 0)
	static readonly j = new Vector(0, 1)
	static readonly ['3D'] = {
		zero: new Vector(0, 0, 0),
		i: new Vector(1, 0, 0),
		j: new Vector(0, 1, 0),
		k: new Vector(0, 0, 1),
	}

	/*
	 * Constructor.
	 */
	
	constructor(input: VectorLike)
	constructor(...coordinates: CoordinateList)
	constructor(...args: [VectorLike] | CoordinateList) {
		// Check for empty input.
		if (args.length === 0) throw new Error(`Invalid Vector: the Vector constructor was called without input. For the zero vector, use Vector.zero or Vector['3D'].zero.`)
			
		// Handle constructor(VectorLike).
		if (args.length === 1) {
			const value = args[0]
			
			// On a Vector, become it.
			if (value instanceof Vector) {
				this._coordinates = value.coordinates
				return
			}
			
			// On a coordinate list, apply it.
			if (isCoordinateList(value)) {
				this._coordinates = value.map(coordinate => ensureNumber(coordinate))
				return
			}
			
			// On a coordinate object, get the coordinates.
			if (isCoordinateObject(value)) {
				this._coordinates = coordinatesFromObject(value)
				return
			}
			
			// Unexpected case.
			throw new Error(`Invalid Vector: expected an array of coordinates or some other Vector-like object but received something of type "${typeof value}".`)
		}
		
		// Handle constructor(...coordinates).
		this._coordinates = args.map(coordinate => ensureNumber(coordinate))
	}

	/*
	 * Fundamentals.
	 */
	
	static readonly type = 'Vector'
	
	get type(): string {
		return (this.constructor as typeof Vector).type
	}

	get coordinates(): CoordinateList {
		return [...this._coordinates]
	}

	clone(): Vector {
		return new Vector(this._coordinates)
	}

	toStorageValue(): VectorData {
		return this.coordinates
	}

	get SO(): VectorData { // SO legacy
		return this.toStorageValue()
	}

	static fromStorageValue(coordinates: VectorData): Vector {
		return new Vector(coordinates)
	}

	/*
	 * Argument checks.
	 */

	private ensureValidIndex(index: number): number {
		index = ensureInt(index)
		if (index < 0) throw new Error(`Invalid vector index: the index cannot be negative. However, ${index} was received.`)
		if (index >= this.dimension) throw new Error(`Invalid vector index: the index cannot be larger than the vector dimension. However, ${index} was received for a vector of dimension ${this.dimension}.`)
		return index
	}

	private coerceVector(value: VectorLike, dimension = this.dimension): Vector {
		const vector = new Vector(value)
		if (vector.dimension !== dimension) throw new Error(`Invalid Vector dimension: expected a vector of dimension ${dimension} but received a vector of dimension ${vector.dimension}.`)
		return vector
	}

	/*
	 * Entry access.
	 */

	get x(): number | undefined {
		return this._coordinates[0]
	}

	get y(): number | undefined {
		return this._coordinates[1]
	}

	get z(): number | undefined {
		return this._coordinates[2]
	}

	getCoordinate(index: number): number {
		return this._coordinates[this.ensureValidIndex(index)]
	}

	set x(x: number | undefined) {
		if (x === undefined) throw new Error(`Invalid x-coordinate: cannot set x to undefined.`)
		this.setCoordinate(0, x)
	}

	set y(y: number | undefined) {
		if (y === undefined) throw new Error(`Invalid y-coordinate: cannot set y to undefined.`)
		this.setCoordinate(1, y)
	}

	set z(z: number | undefined) {
		if (z === undefined) throw new Error(`Invalid z-coordinate: cannot set z to undefined.`)
		this.setCoordinate(2, z)
	}

	setCoordinate(index: number, value: number): void {
		this._coordinates[this.ensureValidIndex(index)] = ensureNumber(value)
	}

	/*
	 * Derived properties.
	 */

	get dimension(): number {
		return this._coordinates.length
	}

	get squaredMagnitude(): number {
		return this._coordinates.reduce((sum, coordinate) => sum + coordinate ** 2, 0)
	}

	get magnitude(): number {
		return Math.sqrt(this.squaredMagnitude)
	}

	get unitVector(): Vector {
		return this.normalize()
	}

	// The argument of a 2D vector in radians, measured counterclockwise from the positive x-axis.
	get argument(): number {
		if (this.dimension !== 2) throw new Error(`Invalid argument call: cannot calculate the argument of a ${this.dimension}D vector.`)
		return Math.atan2(this.y!, this.x!)
	}

	get str(): string {
		return this.toString()
	}

	toString(): string {
		return `[${this._coordinates.join(', ')}]`
	}

	/*
	 * Checks.
	 */

	isZero(): boolean {
		return compareNumbers(this.squaredMagnitude, 0)
	}

	/*
	 * Comparisons.
	 */

	equals(vector: VectorLike): boolean {
		const other = this.coerceVector(vector)
		return this.dimension === other.dimension && this._coordinates.every((value, index) => compareNumbers(value, other._coordinates[index]))
	}

	isEqualMagnitude(vector: VectorLike): boolean {
		return compareNumbers(this.squaredMagnitude, this.coerceVector(vector).squaredMagnitude)
	}

	isEqualDirection(vector: VectorLike, allowReverse = false): boolean {
		const other = this.coerceVector(vector)
		if (other.isZero()) throw new Error(`Invalid isEqualDirection call: cannot compare direction with the zero vector.`)
		const dotProduct = this.dotProduct(other)
		return compareNumbers(allowReverse ? Math.abs(dotProduct) : dotProduct, this.magnitude * other.magnitude)
	}

	isOrthogonal(vector: VectorLike): boolean {
		return compareNumbers(this.dotProduct(this.coerceVector(vector)), 0)
	}

	/*
	 * Operations.
	 */

	reverse(): Vector {
		return this.multiply(-1)
	}

	add(vector: VectorLike): Vector {
		const other = this.coerceVector(vector)
		return new Vector(this._coordinates.map((value, index) => value + other.getCoordinate(index)))
	}

	subtract(vector: VectorLike): Vector {
		return this.add(this.coerceVector(vector).reverse())
	}

	// Multiply the vector by a scalar.
	multiply(value: number): Vector {
		return new Vector(this._coordinates.map(coordinate => coordinate * value))
	}

	// Divide the vector by a scalar.
	divide(value: number): Vector {
		return this.multiply(1 / value)
	}

	// Interpolate between this vector and another vector. factor = 0 keeps this vector; factor = 1 uses the other vector.
	interpolate(vector: VectorLike, factor = 0.5): Vector {
		return this.multiply(1 - factor).add(this.coerceVector(vector).multiply(factor))
	}

	normalize(): Vector {
		return this.setMagnitude(1)
	}

	setMagnitude(magnitude: number): Vector {
		if (this.isZero()) throw new Error(`Invalid setMagnitude call: cannot set the magnitude of the zero vector.`)
		return this.multiply(magnitude / this.magnitude)
	}

	// Round each coordinate of the vector.
	round(): Vector {
		return new Vector(this._coordinates.map(value => Math.round(value)))
	}

	// Shorten the vector by a given distance while keeping its direction. If the distance is larger than the magnitude, the zero vector is returned.
	shorten(distance: number): Vector {
		return this.multiply(Math.max(0, 1 - distance / this.magnitude))
	}

	dotProduct(vector: VectorLike): number {
		const other = this.coerceVector(vector)
		return this._coordinates.reduce((sum, value, index) => sum + value * other.getCoordinate(index), 0)
	}

	// For 2D vectors, get the z-component of the cross product as a number. For 3D vectors, get the full cross product vector.
	crossProduct(vector: VectorLike): number | Vector {
		const other = this.coerceVector(vector)
		if (this.dimension !== 2 && this.dimension !== 3) throw new Error(`Invalid crossProduct call: can only ask for a cross product on three-dimensional vectors. Two-dimensional vectors may also be possible, in which the z-component is used. However, the vector has dimension ${this.dimension}.`)

		const a = this._coordinates
		const b = other._coordinates
		if (this.dimension === 2) return a[0]! * b[1]! - a[1]! * b[0]!
		return new Vector([
			a[1]! * b[2]! - a[2]! * b[1]!,
			a[2]! * b[0]! - a[0]! * b[2]!,
			a[0]! * b[1]! - a[1]! * b[0]!,
		])
	}

	distanceTo(vector: VectorLike): number {
		return Math.sqrt(this.squaredDistanceTo(vector))
	}

	squaredDistanceTo(vector: VectorLike): number {
		return this.subtract(this.coerceVector(vector)).squaredMagnitude
	}

	// Project of this vector onto the given vector's line.
	projectOnto(vector: VectorLike): Vector {
		const other = this.coerceVector(vector)
		if (other.isZero()) throw new Error(`Invalid projectOnto call: cannot project onto the zero vector.`)
		return other.multiply(this.dotProduct(other) / other.squaredMagnitude)
	}

	// Component of this vector orthogonal to the given vector.
	orthogonalComponent(vector: VectorLike): Vector {
		return this.subtract(this.projectOnto(vector))
	}

	/*
	 * Static creation methods.
	 */

	// Get the zero vector, in the given dimension.
	static getZero(dimension: number): Vector {
		dimension = ensureInt(dimension, true)
		return new Vector(new Array(dimension).fill(0))
	}

	// Get the unit vector along the given axis, in the given dimension.
	static getUnitVector(axis: number, dimension: number): Vector {
		// Check input.
		axis = ensureInt(axis, true)
		dimension = ensureInt(dimension, true)
		if (axis >= dimension) throw new Error(`Invalid axis: cannot have an axis (${axis}) equal to or larger than the dimension (${dimension}).`)

		// Generate the vector.
		const coordinates = new Array<number>(dimension).fill(0)
		coordinates[axis] = 1
		return new Vector(coordinates)
	}

	static fromPolar(magnitude: number, argument: number): Vector {
		return new Vector(magnitude * Math.cos(argument), magnitude * Math.sin(argument))
	}
}
