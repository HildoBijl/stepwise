import { type VectorLike, Vector, ensureVector } from '../Vector/index.ts'
import { type LineLike, Line, ensureLine } from '../Line/index.ts'

import type { LineSegmentInput, LineSegmentStorageValue } from './types.ts'
import { isLineSegmentObject } from './support.ts'

export const LineSegmentType = 'LineSegment'
export type LineSegmentType = typeof LineSegmentType

export type { LineSegmentStorageValue }
export type LineSegmentLike = LineSegment | LineSegmentInput

const pointNames = ['start', 'end'] as const

export class LineSegment {
	private readonly _start: Vector
	private readonly _end: Vector

	/*
	 * Constructor.
	 */

	constructor(input: LineSegmentLike)
	constructor(start: VectorLike, end: VectorLike)
	constructor(...args: [LineSegmentLike] | [VectorLike, VectorLike]) {
		if (args.length === 1) {
			const value = args[0]

			// On a LineSegment, become it.
			if (value instanceof LineSegment) {
				this._start = value._start.clone()
				this._end = value._end.clone()
				return
			}

			// Make sure we have a LineSegment object.
			if (!isLineSegmentObject(value)) throw new Error(`Invalid LineSegment value: expected an object with "start", "end" and/or "vector" points (two out of the three) but received something of type "${typeof value}".`)

			// Look at the various cases of what is provided.
			const hasStart = value.start !== undefined
			const hasVector = value.vector !== undefined
			const hasEnd = value.end !== undefined

			if (!hasEnd) {
				this._start = ensureVector(value.start)
				const vector = ensureVector(value.vector, { dimension: this._start.dimension })
				this._end = this._start.add(vector)
				return
			}

			if (!hasStart) {
				this._end = ensureVector(value.end)
				const vector = ensureVector(value.vector, { dimension: this._end.dimension })
				this._start = this._end.subtract(vector)
				return
			}

			this._start = ensureVector(value.start)
			this._end = ensureVector(value.end, { dimension: this._start.dimension })

			// On all three parameters, run a check to see if they match.
			if (hasVector) {
				const actualVector = this._end.subtract(this._start)
				const givenVector = ensureVector(value.vector, { dimension: this._start.dimension })
				if (!actualVector.equals(givenVector)) throw new Error(`Invalid LineSegment: the given vector "${givenVector}" is not the difference between the start "${this._start}" and the end "${this._end}".`)
			}
			return
		}

		if (args.length === 2) {
			this._start = ensureVector(args[0])
			this._end = ensureVector(args[1], { dimension: this._start.dimension })
			return
		}

		throw new Error(`Invalid LineSegment input: expected either one line-segment-like object or a start and end vector.`)
	}

	/*
	 * Fundamentals.
	 */

	static readonly type = LineSegmentType

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

	toStorageValue(): LineSegmentStorageValue {
		return {
			start: this._start.toStorageValue(),
			end: this._end.toStorageValue(),
		}
	}

	static fromStorageValue(value: LineSegmentStorageValue): LineSegment {
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

	hasEndpoint(point: VectorLike): boolean {
		const ensuredPoint = ensureVector(point, { dimension: this.dimension })
		return pointNames.some(pointName => this[pointName].equals(ensuredPoint))
	}

	sharesEndpointWith(lineSegment: LineSegmentLike): boolean {
		const other = this.coerceLineSegment(lineSegment)
		return pointNames.some(pointName => this.hasEndpoint(other[pointName]))
	}

	liesOnLine(line: LineLike, requireSameDirection = false): boolean {
		const ensuredLine = ensureLine(line, { dimension: this.dimension })
		if (this.vector.isZero()) return !requireSameDirection && ensuredLine.containsPoint(this._start)
		return this.line.equals(ensuredLine, requireSameDirection)
	}

	isCollinearWith(lineSegment: LineSegmentLike, requireSameDirection = false, requireMatchingPoint = false): boolean {
		const other = this.coerceLineSegment(lineSegment)
		if (requireMatchingPoint && !this.sharesEndpointWith(other)) return false
		if (other.vector.isZero()) {
			if (this.vector.isZero()) return true
			return other.liesOnLine(this.line, requireSameDirection)
		}
		return this.liesOnLine(other.line, requireSameDirection)
	}

	isOrthogonalTo(lineSegment: LineSegmentLike): boolean {
		const other = this.coerceLineSegment(lineSegment)
		return this.vector.isOrthogonalTo(other.vector)
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
		const offset = ensureVector(vector, { dimension: this.dimension })
		return new LineSegment({ start: this._start.add(offset), end: this._end.add(offset) })
	}

	subtract(vector: VectorLike): LineSegment {
		const offset = ensureVector(vector, { dimension: this.dimension })
		return new LineSegment({ start: this._start.subtract(offset), end: this._end.subtract(offset) })
	}
}
