import { ensureInt, ensureNumber, compareNumbers } from '@step-wise/utils'

import { Vector, type VectorLike, ensureVector } from '../Vector'
import { type TransformationLike, ensureTransformation } from '../Transformation'

import type { LineData, LineInput } from './types'
import { isLineObject } from './support'

export type { LineData }
export type LineLike = Line | LineInput

export class Line {
	private _start: Vector
	private _direction: Vector

	/*
	 * Common lines.
	 */

	static readonly xAxis = Line.getAxisLineThrough(Vector.zero, 0)
	static readonly yAxis = Line.getAxisLineThrough(Vector.zero, 1)
	static readonly ['3D'] = {
		xAxis: Line.getAxisLineThrough(Vector['3D'].zero, 0),
		yAxis: Line.getAxisLineThrough(Vector['3D'].zero, 1),
		zAxis: Line.getAxisLineThrough(Vector['3D'].zero, 2),
	}

	/*
	 * Constructor.
	 */

	constructor(input: LineLike)
	constructor(start: VectorLike, direction: VectorLike)
	constructor(...args: [LineLike] | [VectorLike, VectorLike]) {
		let start: VectorLike
		let direction: VectorLike

		// Determine the start and direction parameters.
		if (args.length === 1) {
			const value = args[0]

			// On a line, become it. No further checks needed.
			if (value instanceof Line) {
				this._start = value.start
				this._direction = value.direction
				return
			}

			// On an object, extract the parameters.
			if (!isLineObject(value)) throw new Error(`Invalid Line: expected an object that could be turned into a Line, but received something of type "${typeof value}".`)
			start = value.start
			direction = value.direction
		} else if (args.length === 2) {
			start = args[0]
			direction = args[1]
		} else {
			throw new Error(`Invalid Line input: expected either one line-like object or a start and direction vector.`)
		}

		this._start = ensureVector(start)
		this._direction = ensureVector(direction, this._start.dimension)
		if (this._direction.isZero()) throw new Error(`Invalid Line direction: cannot accept a direction Vector with zero magnitude.`)
	}

	/*
	 * Fundamentals.
	 */

	static readonly type = 'Line'

	get type(): string {
		return (this.constructor as typeof Line).type
	}

	get start(): Vector {
		return this._start.clone()
	}

	get direction(): Vector {
		return this._direction.clone()
	}

	clone(): Line {
		return new Line(this._start, this._direction)
	}

	toStorageValue(): LineData {
		return {
			start: this._start.toStorageValue(),
			direction: this._direction.toStorageValue(),
		}
	}

	get SO(): LineData { // SO legacy
		return this.toStorageValue()
	}

	static fromStorageValue(value: LineData): Line {
		return new Line(value)
	}

	/*
	 * Argument checks.
	 */

	private coerceLine(value: LineLike, dimension = this.dimension): Line {
		const line = new Line(value)
		if (line.dimension !== dimension) throw new Error(`Invalid Line dimension: expected a Line of dimension ${dimension} but received one of dimension ${line.dimension}.`)
		return line
	}

	/*
	 * Derived properties.
	 */

	get dimension(): number {
		return this._start.dimension
	}

	get secondPoint(): Vector {
		return this._start.add(this._direction)
	}

	get normalizedDirection(): Vector {
		return this._direction.normalize()
	}

	get angle(): number {
		if (this.dimension !== 2) throw new Error(`Invalid angle call: cannot retrieve the angle of a ${this.dimension}D line.`)
		return this._direction.argument
	}

	get originOffset(): Vector {
		return this._start.orthogonalComponent(this._direction)
	}

	get distanceFromOrigin(): number {
		return this.originOffset.magnitude
	}

	get str(): string {
		return this.toString()
	}

	toString(): string {
		return `Line({ start: ${this._start}, direction: ${this._direction} })`
	}

	/*
	 * Vector calculations.
	*/

	containsPoint(vector: VectorLike): boolean {
		const point = ensureVector(vector, this.dimension)
		const relativeFromStart = point.subtract(this._start)
		const relativeFromLine = relativeFromStart.orthogonalComponent(this._direction)
		return relativeFromLine.isZero()
	}

	getClosestPoint(vector: VectorLike): Vector {
		const point = ensureVector(vector, this.dimension)
		const relativeVector = point.subtract(this._start)
		const projection = relativeVector.projectOnto(this._direction)
		return this._start.add(projection)
	}

	getSquaredDistanceFrom(vector: VectorLike): number {
		const point = ensureVector(vector, this.dimension)
		const closestPoint = this.getClosestPoint(point)
		return point.subtract(closestPoint).squaredMagnitude
	}

	getDistanceFrom(vector: VectorLike): number {
		return Math.sqrt(this.getSquaredDistanceFrom(vector))
	}

	// Get the point p on the line such that p[axis] = value.
	getPointWithCoordinate(axis: number, value: number): Vector {
		const factor = this.getFactorOfPointWithCoordinate(axis, value)
		return this.getPointWithFactor(factor)
	}

	// Find factor a such that start + a * direction is the closest point on the line.
	getDirectionFactor(vector: VectorLike): number {
		const closestPoint = this.getClosestPoint(vector)
		const relativeVector = closestPoint.subtract(this._start)
		return this._direction.dotProduct(relativeVector) / this._direction.squaredMagnitude
	}

	// Find the point p = start + factor * direction.
	getPointWithFactor(factor: number): Vector {
		return this._start.add(this._direction.multiply(ensureNumber(factor)))
	}

	// Find the factor of the point p on the line satisfying p[axis] = value.
	getFactorOfPointWithCoordinate(axis: number, value = 0): number {
		axis = ensureInt(axis, true)
		value = ensureNumber(value)
		if (axis >= this.dimension) throw new Error(`Invalid axis: the axis (${axis}) cannot be higher than the dimension (${this.dimension}) of the line.`)
		const directionCoordinate = this._direction.getCoordinate(axis)
		if (compareNumbers(directionCoordinate, 0)) throw new Error(`Invalid getPointWithCoordinate call: the line is parallel to the given axis (${axis}), so no intersecting point can be computed.`)
		return (value - this._start.getCoordinate(axis)) / directionCoordinate
	}

	/*
	 * Comparisons.
	 */

	equals(line: LineLike, requireSameDirection = false): boolean {
		const other = this.coerceLine(line)
		if (!this.originOffset.equals(other.originOffset)) return false
		const dotProduct = this.normalizedDirection.dotProduct(other.normalizedDirection)
		return compareNumbers(requireSameDirection ? dotProduct : Math.abs(dotProduct), 1)
	}

	isOrthogonal(line: LineLike): boolean {
		const other = this.coerceLine(line)
		return this._direction.isOrthogonal(other._direction)
	}

	intersects(line: LineLike): boolean {
		const other = this.coerceLine(line)
		if (this.dimension === 1) return true
		return this.getIntersection(other) !== null
	}

	// Find the intersection point of two 2D lines. Returns null if no unique intersection exists.
	getIntersection(line: LineLike): Vector | null {
		const other = this.coerceLine(line)
		if (this.dimension === 1) throw new Error(`Invalid getIntersection call: two lines in one dimension intersect everywhere. Ensure that you do not have a one-dimensional case.`)
		if (this.dimension !== 2) throw new Error(`Invalid getIntersection call: intersection calculation is only implemented for 2D lines, but received dimension ${this.dimension}.`)

		// Check that an intersection exists.
		const d1 = this._direction
		const d2 = other._direction
		const determinant = d1.x! * d2.y! - d2.x! * d1.y!
		if (compareNumbers(determinant, 0)) return null

		// Find the intersection.
		const delta = other._start.subtract(this._start)
		const a = (delta.x! * d2.y! - delta.y! * d2.x!) / determinant
		const intersection = this._start.add(this._direction.multiply(a))
		return this.containsPoint(intersection) ? intersection : null
	}

	/*
	 * Operations.
	 */

	normalize(): Line {
		return new Line(this.originOffset, this.normalizedDirection)
	}

	reverse(): Line {
		return new Line(this._start, this._direction.reverse())
	}

	/*
	 * Static creation methods.
	 */

	static fromPoints(point1: VectorLike, point2: VectorLike): Line {
		const start = ensureVector(point1)
		const end = ensureVector(point2, start.dimension)
		return new Line(start, end.subtract(start))
	}

	static fromAngleAndDistance(angle: number, distance: number): Line {
		return new Line(Vector.fromPolar(distance, ensureNumber(angle) - Math.PI / 2), Vector.fromPolar(1, angle))
	}

	static fromPointAndAngle(point: VectorLike, angle: number): Line {
		const start = ensureVector(point, 2)
		return new Line(start, Vector.fromPolar(1, angle))
	}

	static getAxisLineThrough(point: VectorLike, axis: number): Line {
		const start = ensureVector(point)
		axis = ensureInt(axis)
		if (axis < 0 || axis >= start.dimension) throw new Error(`Invalid axis: expected a number between 0 (inclusive) and the point dimension ${start.dimension} (exclusive) but received ${axis}.`)
		return new Line(start, Vector.getUnitVector(axis, start.dimension))
	}

	static getHorizontalThrough(point: VectorLike): Line {
		return Line.getAxisLineThrough(point, 0)
	}

	static getVerticalThrough(point: VectorLike): Line {
		return Line.getAxisLineThrough(point, 1)
	}
}
