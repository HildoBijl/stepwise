import { ensureNumber, approximatelyEqual, clamp, integerRange, findOptimumIndex, repeat } from '@step-wise/js-utils'

import { type VectorLike, Vector, ensureVector } from '../Vector/index.ts'
import { type LineLike, ensureLine } from '../Line/index.ts'
import { type LineSegmentLike, LineSegment, ensureLineSegment } from '../LineSegment/index.ts'

import type { RectangleInput, RectangleStorageValue } from './types.ts'
import { isRectangleObject, getMinAndMax } from './support.ts'

export const RectangleType = 'Rectangle'
export type RectangleType = typeof RectangleType

export type { RectangleStorageValue }
export type RectangleLike = Rectangle | RectangleInput

function isApproximatelyAtLeast(value: number, lowerBound: number): boolean {
	return value > lowerBound || approximatelyEqual(value, lowerBound)
}

function isApproximatelyAtMost(value: number, upperBound: number): boolean {
	return value < upperBound || approximatelyEqual(value, upperBound)
}

export class Rectangle {
	private readonly _min: Vector
	private readonly _max: Vector

	/*
	 * Constructor.
	 */

	constructor(rectangle: RectangleLike)
	constructor(min: VectorLike, max: VectorLike)
	constructor(...args: [RectangleLike] | [VectorLike, VectorLike]) {
		// Handle constructor(RectangleLike).
		if (args.length === 1) {
			const value = args[0]

			// On a Rectangle, become it.
			if (value instanceof Rectangle) {
				this._min = value._min.clone()
				this._max = value._max.clone()
				return
			}

			// Make sure we have a Rectangle object.
			if (!isRectangleObject(value)) throw new Error(`Invalid Rectangle value: expected an object with "min", "max" and/or "size" points (two out of the three) but received something of type "${typeof value}".`)

			// Look at the various cases of what is provided.
			const hasMin = value.min !== undefined
			const hasMax = value.max !== undefined
			const hasSize = value.size !== undefined

			if (!hasMax) {
				this._min = ensureVector(value.min)
				const size = ensureVector(value.size, { dimension: this._min.dimension })
				this._max = this._min.add(size)
			} else if (!hasMin) {
				this._max = ensureVector(value.max)
				const size = ensureVector(value.size, { dimension: this._max.dimension })
				this._min = this._max.subtract(size)
			} else {
				this._min = ensureVector(value.min)
				this._max = ensureVector(value.max, { dimension: this._min.dimension })
			}
			[this._min, this._max] = getMinAndMax(this._min, this._max)

			// On all three parameters, run a check to see if they match.
			if (hasSize) {
				const actualSize = this._max.subtract(this._min)
				const givenSize = ensureVector(value.size, { dimension: this._min.dimension })
				if (!actualSize.equals(givenSize)) throw new Error(`Invalid Rectangle: the given size "${givenSize}" is not the difference between the minimum "${this._min}" and the maximum "${this._max}" values.`)
			}
			return
		}

		if (args.length === 2) {
			[this._min, this._max] = getMinAndMax(args[0], args[1])
			return
		}

		throw new Error(`Invalid Rectangle input: expected either one rectangle-like object or two corner points.`)
	}

	/*
	 * Fundamentals.
	 */

	static readonly type = RectangleType

	get type(): string {
		return (this.constructor as typeof Rectangle).type
	}

	get min(): Vector {
		return this._min.clone()
	}

	get max(): Vector {
		return this._max.clone()
	}

	clone(): Rectangle {
		return new Rectangle({ min: this._min, max: this._max })
	}

	toStorageValue(): RectangleStorageValue {
		return {
			min: this._min.toStorageValue(),
			max: this._max.toStorageValue(),
		}
	}

	static fromStorageValue(value: RectangleStorageValue): Rectangle {
		return new Rectangle(value)
	}

	/*
	 * Argument checks.
	 */

	private coerceRectangle(value: RectangleLike, dimension = this.dimension): Rectangle {
		const rectangle = new Rectangle(value)
		if (rectangle.dimension !== dimension) throw new Error(`Invalid Rectangle dimension: expected a rectangle of dimension ${dimension} but received a rectangle of dimension ${rectangle.dimension}.`)
		return rectangle
	}

	/*
	 * Derived properties.
	 */

	get dimension(): number {
		return this._min.dimension
	}

	get str(): string {
		return this.toString()
	}

	toString(): string {
		return `Rectangle({ min: ${this._min}, max: ${this._max} })`
	}

	get width(): number {
		if (this.dimension !== 2) throw new Error(`Invalid width request: cannot give the width of a ${this.dimension}D rectangle. This is only possible for 2D rectangles.`)
		return this.getSize(0)
	}

	get height(): number {
		if (this.dimension !== 2) throw new Error(`Invalid height request: cannot give the height of a ${this.dimension}D rectangle. This is only possible for 2D rectangles.`)
		return this.getSize(1)
	}

	getBounds(axis: number): [number, number] {
		return [this._min.getCoordinate(axis), this._max.getCoordinate(axis)]
	}

	get bounds(): [number, number][] {
		return integerRange(0, this.dimension - 1).map(axis => this.getBounds(axis))
	}

	getSize(axis: number): number {
		const [min, max] = this.getBounds(axis)
		return max - min
	}

	get size(): Vector {
		return this.max.subtract(this.min)
	}

	/*
	 * Named properties.
	 */

	get midpoint(): Vector {
		return this._min.interpolate(this._max)
	}

	// left, right, top and bottom are the four sides of the two-dimensional rectangle. We find the respective coordinate value.
	private runNamedPointCheck() {
		if (this.dimension !== 2) throw new Error(`Invalid point request: cannot use named points (like left, top, top-left, bottom-right) for a ${this.dimension}D rectangle. This is only possible for 2D rectangles.`)
	}
	get left(): number {
		this.runNamedPointCheck()
		return this._min.x
	}
	get right(): number {
		this.runNamedPointCheck()
		return this._max.x
	}
	get bottom(): number {
		this.runNamedPointCheck()
		return this._min.y
	}
	get top(): number {
		this.runNamedPointCheck()
		return this._max.y
	}

	// topLeft, topMiddle, topRight, rightMiddle, bottomRight, bottomMiddle, bottomLeft and leftMiddle are the vectors representing each of these points for the rectangle.
	get topLeft(): Vector {
		this.runNamedPointCheck()
		return new Vector(this.min.x, this.max.y)
	}
	get topMiddle(): Vector {
		this.runNamedPointCheck()
		return new Vector(this.midpoint.x, this.max.y)
	}
	get topRight(): Vector {
		this.runNamedPointCheck()
		return this.max
	}
	get middleRight(): Vector {
		this.runNamedPointCheck()
		return new Vector(this.max.x, this.midpoint.y)
	}
	get bottomRight(): Vector {
		this.runNamedPointCheck()
		return new Vector(this.max.x, this.min.y)
	}
	get bottomMiddle(): Vector {
		this.runNamedPointCheck()
		return new Vector(this.midpoint.x, this.min.y)
	}
	get bottomLeft(): Vector {
		this.runNamedPointCheck()
		return this.min
	}
	get middleLeft(): Vector {
		this.runNamedPointCheck()
		return new Vector(this.min.x, this.midpoint.y)
	}

	/*
	 * Vector checks and calculations.
	 */

	// Check if a given point is within (or on the bounds of) the Rectangle.
	containsPoint(vector: VectorLike): boolean {
		const point = ensureVector(vector, { dimension: this.dimension })
		return integerRange(0, this.dimension - 1).every(axis => {
			const coordinate = point.getCoordinate(axis)
			const [min, max] = this.getBounds(axis)
			return isApproximatelyAtLeast(coordinate, min) && isApproximatelyAtMost(coordinate, max)
		})
	}

	// Check if a given point is exactly on the bounds of the Rectangle.
	isPointOnBoundary(vector: VectorLike): boolean {
		const point = ensureVector(vector, { dimension: this.dimension })
		return this.containsPoint(point) && integerRange(0, this.dimension - 1).some(axis => this.getBounds(axis).some(bound => approximatelyEqual(point.getCoordinate(axis), bound)))
	}

	// Find the closest point within the Rectangle. Points within the Rectangle are kept, unless the alwaysPutOnEdge flag is set to true, in which case the closest point on the Rectangle's edge is given.
	clampPoint(vector: VectorLike, options: { forceBoundary?: boolean } = {}): Vector {
		const point = ensureVector(vector, { dimension: this.dimension })
		const boundedPoint = new Vector(point.coordinates.map((coordinate, axis) => clamp(coordinate, ...this.getBounds(axis))))

		// If we don't have an internal point to put on the edge, coordinate-wise clamping is sufficient.
		if (!options.forceBoundary || !this.containsPoint(point)) return boundedPoint

		// We have an internal point to put on the edge. Find the axis where the distance is the smallest.
		const distancesAlongAxes = boundedPoint.coordinates.map((coordinate, axis) => Math.min(...this.getBounds(axis).map(bound => Math.abs(bound - coordinate))))
		const shiftAxis = findOptimumIndex(distancesAlongAxes, (a, b) => a < b)

		// Shift the point along the given axis to the nearest bound.
		return new Vector(boundedPoint.coordinates.map((coordinate, axis) => {
			if (axis !== shiftAxis) return coordinate
			const bounds = this.getBounds(axis)
			const distances = bounds.map(bound => Math.abs(bound - coordinate))
			const boundIndex = findOptimumIndex(distances, (a, b) => a < b)
			return bounds[boundIndex]!
		}))
	}

	// Find the distance of a point to the Rectangle. A point inside the Rectangle always has distance zero, unless toBounds is set to true, in which case the distance to the nearest bound is taken.
	getDistanceToPoint(vector: VectorLike, options: { toBoundary?: boolean } = {}): number {
		const point = ensureVector(vector, { dimension: this.dimension })
		return this.clampPoint(point, { forceBoundary: options.toBoundary }).subtract(point).magnitude
	}

	// Check if a circle is fully encompassed by the Rectangle.
	containsCircle(center: VectorLike, radius: number): boolean {
		const ensuredCenter = ensureVector(center, { dimension: this.dimension })
		return this.containsPoint(ensuredCenter) && isApproximatelyAtLeast(this.getDistanceToPoint(ensuredCenter, { toBoundary: true }), ensureNumber(radius, { nonNegative: true }))
	}

	// Check if a circle and the Rectangle share any point, including when either fully contains the other.
	intersectsCircle(center: VectorLike, radius: number): boolean {
		return isApproximatelyAtMost(this.getDistanceToPoint(ensureVector(center, { dimension: this.dimension })), ensureNumber(radius, { nonNegative: true }))
	}

	/*
	 * Line/LineSegment checks and calculations.
	 */

	// Check if the Rectangle completely envelopes a LineSegment.
	containsLineSegment(lineSegment: LineSegmentLike): boolean {
		const ensuredLineSegment = ensureLineSegment(lineSegment, { dimension: this.dimension })
		return this.containsPoint(ensuredLineSegment.start) && this.containsPoint(ensuredLineSegment.end)
	}

	// Check if a LineSegment and the Rectangle share any point, including complete containment.
	intersectsLineSegment(lineSegment: LineSegmentLike): boolean {
		const ensuredLineSegment = ensureLineSegment(lineSegment, { dimension: this.dimension })
		if (ensuredLineSegment.vector.isZero()) return this.containsPoint(ensuredLineSegment.start)

		// Check if the LineSegment's Line intersects the Rectangle.
		const linePartFactors = this.getLineIntersectionFactors(ensuredLineSegment.line)
		if (!linePartFactors) return false

		// Check which part of the Line falls within the Rectangle.
		const [lower, upper] = linePartFactors
		return isApproximatelyAtMost(lower, 1) && isApproximatelyAtLeast(upper, 0)
	}

	// Find the LineSegment lying on a line that falls within the Rectangle. Returns undefined if the Line does not intersect the Rectangle.
	getLineIntersection(line: LineLike): LineSegment | undefined {
		const ensuredLine = ensureLine(line, { dimension: this.dimension })
		const linePartFactors = this.getLineIntersectionFactors(ensuredLine)
		if (!linePartFactors) return undefined
		return new LineSegment({
			start: ensuredLine.getPointAtFactor(linePartFactors[0]),
			end: ensuredLine.getPointAtFactor(linePartFactors[1]),
		})
	}

	// Find which parts of a Line fall within the Rectangle. Return the respective Line factors. If the Line does not intersect the Rectangle, undefined is returned.
	private getLineIntersectionFactors(line: LineLike): [number, number] | undefined {
		const ensuredLine = ensureLine(line, { dimension: this.dimension })

		// Get the minimum and maximum factor of all the intersection points of the line with the box.
		let lower: number | undefined
		let upper: number | undefined
		repeat(this.dimension, axis => {
			// Special case: if the Line is parallel to this axis, check if the given coordinate falls within the rectangle.
			if (approximatelyEqual(ensuredLine.direction.getCoordinate(axis), 0)) {
				const coordinate = ensuredLine.start.getCoordinate(axis)
				const bounds = this.getBounds(axis)
				if (!isApproximatelyAtLeast(coordinate, bounds[0]) || !isApproximatelyAtMost(coordinate, bounds[1])) {
					lower = Infinity
					upper = -Infinity
				}
				return
			}

			// Find the factors of the points at which the line intersects with the given coordinates.
			const newLowerUpperBounds = this.getBounds(axis).map(bound => ensuredLine.getFactorAtCoordinate(axis, bound)).sort((a, b) => a - b)
			if (lower === undefined || newLowerUpperBounds[0] > lower) lower = newLowerUpperBounds[0]
			if (upper === undefined || newLowerUpperBounds[1] < upper) upper = newLowerUpperBounds[1]
		})

		// Find if the line goes through the rectangle.
		if (lower === undefined || upper === undefined || (upper < lower && !approximatelyEqual(upper, lower))) return undefined
		if (approximatelyEqual(lower, upper)) return [(lower + upper) / 2, (lower + upper) / 2]
		return [lower, upper]
	}

	/*
	 * Comparisons.
	 */

	equals(rectangle: RectangleLike): boolean {
		const other = this.coerceRectangle(rectangle)
		return this._min.equals(other._min) && this._max.equals(other._max)
	}
}
