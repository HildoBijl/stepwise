import { Vector, type VectorLike, ensureVector } from '../Vector'
import { Line, type LineLike, ensureLine } from '../Line'

import type { LineSegmentData, LineSegmentInput } from './types'
import { isLineSegmentObject } from './support'

export type { LineSegmentData }
export type LineSegmentLike = LineSegment | LineSegmentInput

const pointNames = ['start', 'end'] as const

export class LineSegment {
	private _start: Vector
	private _end: Vector

	/*
	 * Constructor.
	 */

	constructor(input: LineSegmentLike)
	constructor(start: VectorLike, end: VectorLike)
	constructor(...args: [LineSegmentLike] | [VectorLike, VectorLike]) {
		if (args.length === 1) {
			const value = args[0]

			if (value instanceof LineSegment) {
				this._start = value._start.clone()
				this._end = value._end.clone()
				return
			}

			if (!isLineSegmentObject(value)) throw new Error(`Invalid LineSegment value: expected to receive some kind of object, but instead received something of type "${typeof value}".`)

			const hasStart = value.start !== undefined
			const hasVector = value.vector !== undefined
			const hasEnd = value.end !== undefined

			if (!hasEnd) {
				this._start = ensureVector(value.start)
				const vector = ensureVector(value.vector, this._start.dimension)
				this._end = this._start.add(vector)
				return
			}

			if (!hasStart) {
				this._end = ensureVector(value.end)
				const vector = ensureVector(value.vector, this._end.dimension)
				this._start = this._end.subtract(vector)
				return
			}

			this._start = ensureVector(value.start)
			this._end = ensureVector(value.end, this._start.dimension)

			if (hasVector) {
				const actualVector = this._end.subtract(this._start)
				const givenVector = ensureVector(value.vector, this._start.dimension)
				if (!actualVector.equals(givenVector)) throw new Error(`Invalid LineSegment: the given vector "${givenVector}" is not the difference between the start "${this._start}" and the end "${this._end}".`)
			}

			return
		}

		if (args.length === 2) {
			this._start = ensureVector(args[0])
			this._end = ensureVector(args[1], this._start.dimension)
			return
		}

		throw new Error(`Invalid LineSegment input: expected either one line-segment-like object or a start and end vector.`)
	}

	/*
	 * Fundamentals.
	 */

	static readonly type = 'LineSegment'

	get type(): string {
		return (this.constructor as typeof LineSegment).type
	}

	get start(): Vector {
		return this._start.clone()
	}

	get vector(): Vector {
		return this._end.subtract(this._start)
	}

	get end(): Vector {
		return this._end.clone()
	}

	clone(): LineSegment {
		return new LineSegment({ start: this._start, end: this._end })
	}

	toStorageValue(): LineSegmentData {
		return {
			start: this._start.toStorageValue(),
			end: this._end.toStorageValue(),
		}
	}

	get SO(): LineSegmentData { // SO legacy
		return this.toStorageValue()
	}

	static fromStorageValue(value: LineSegmentData): LineSegment {
		return new LineSegment(value)
	}

	/*
	 * Argument checks.
	 */

	private coerceLineSegment(value: LineSegmentLike, dimension = this.dimension): LineSegment {
		const lineSegment = new LineSegment(value)
		if (lineSegment.dimension !== dimension) throw new Error(`Invalid LineSegment dimension: expected a LineSegment of dimension ${dimension} but received one of dimension ${lineSegment.dimension}.`)
		return lineSegment
	}

	/*
	 * Derived properties.
	 */

	get dimension(): number {
		return this._start.dimension
	}

	get str(): string {
		return this.toString()
	}

	toString(): string {
		return `LineSegment({ start: ${this._start}, vector: ${this.vector}, end: ${this._end} })`
	}

	get line(): Line {
		const vector = this.vector
		if (vector.isZero()) throw new Error(`Invalid line request: cannot give the line of a LineSegment with zero magnitude.`)
		return new Line(this._start, vector)
	}

	get midpoint(): Vector {
		return this._start.interpolate(this._end)
	}

	/*
	 * Comparisons.
	 */

	equals(lineSegment: LineSegmentLike, allowReverse = false): boolean {
		const other = this.coerceLineSegment(lineSegment)
		if (this._start.equals(other._start) && this._end.equals(other._end)) return true
		if (allowReverse && this._start.equals(other._end) && this._end.equals(other._start)) return true
		return false
	}

	hasPoint(point: VectorLike): boolean {
		const ensuredPoint = ensureVector(point, this.dimension)
		return pointNames.some(pointName => this[pointName].equals(ensuredPoint))
	}

	hasMatchingPoint(lineSegment: LineSegmentLike): boolean {
		const other = this.coerceLineSegment(lineSegment)
		return pointNames.some(pointName => this.hasPoint(other[pointName]))
	}

	isAlongLine(line: LineLike, requireSameDirection = false): boolean {
		const ensuredLine = ensureLine(line, this.dimension)
		if (this.vector.isZero()) return !requireSameDirection && ensuredLine.containsPoint(this._start)
		return this.line.equals(ensuredLine, requireSameDirection)
	}

	alongEqualLine(lineSegment: LineSegmentLike, requireSameDirection = false, requireMatchingPoint = false): boolean {
		const other = this.coerceLineSegment(lineSegment)
		if (requireMatchingPoint && !this.hasMatchingPoint(other)) return false
		if (other.vector.isZero()) {
			if (this.vector.isZero()) return true
			return other.isAlongLine(this.line, requireSameDirection)
		}
		return this.isAlongLine(other.line, requireSameDirection)
	}

	isOrthogonal(lineSegment: LineSegmentLike): boolean {
		const other = this.coerceLineSegment(lineSegment)
		return this.vector.isOrthogonal(other.vector)
	}

	/*
	 * Operations.
	 */

	reverse(): LineSegment {
		return new LineSegment({ start: this._end, end: this._start })
	}

	round(): LineSegment {
		return new LineSegment({ start: this._start.round(), end: this._end.round() })
	}

	add(vector: VectorLike): LineSegment {
		const offset = ensureVector(vector, this.dimension)
		return new LineSegment({ start: this._start.add(offset), end: this._end.add(offset) })
	}

	subtract(vector: VectorLike): LineSegment {
		const offset = ensureVector(vector, this.dimension)
		return new LineSegment({ start: this._start.subtract(offset), end: this._end.subtract(offset) })
	}
}
