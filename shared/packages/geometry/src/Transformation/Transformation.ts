import { ensureInt, ensureNumber } from '@step-wise/utils'

import { type VectorLike, Vector, ensureVector, isVectorLike } from '../Vector'
import { type LineLike, Line, ensureLine, isLineLike } from '../Line'
import { type LineSegmentLike, LineSegment, ensureLineSegment, isLineSegmentLike } from '../LineSegment'
import { type RectangleLike, Rectangle, ensureRectangle, isRectangleLike } from '../Rectangle'
import { type MatrixLike, Matrix, ensureSquareMatrix } from '../Matrix'

import type { TransformationInput, TransformationData, TransformableLike } from './types'
import { isTransformationDescription } from './support'

export type { TransformationData }
export type TransformationLike = Transformation | TransformationInput

export class Transformation {
	private _matrix: Matrix
	private _translation: Vector

	/*
	 * Common transformations.
	 */

	static readonly horizontalFlip = Transformation.fromReflection([1, 0])
	static readonly verticalFlip = Transformation.fromReflection([0, 1])

	/*
	 * Constructor.
	 */

	constructor(input: TransformationLike)
	constructor(matrix: MatrixLike, translation?: VectorLike)
	constructor(...args: [TransformationLike] | [MatrixLike, VectorLike?]) {
		let matrix: MatrixLike
		let translation: VectorLike | undefined

		// Determine the matrix and translation parameters.
		if (args.length === 1) {
			const value = args[0]

			// On a Transformation, become it. No further checks needed.
			if (value instanceof Transformation) {
				this._matrix = value.matrix
				this._translation = value.translation
				return
			}

			// On an object with data, process the data.
			if (isTransformationDescription(value)) {
				matrix = value.matrix
				translation = value.translation
			} else {
				matrix = value
			}
		} else if (args.length === 2) {
			matrix = args[0]
			translation = args[1]
		} else {
			throw new Error(`Invalid Transformation input: received ${args.length} parameters, but only a Matrix and optionally a Vector are expected.`)
		}

		// Check and store the matrix and translation.
		this._matrix = ensureSquareMatrix(matrix)
		this._translation = translation === undefined ? Vector.getZero(this._matrix.width) : ensureVector(translation, this._matrix.width)
	}

	/*
	 * Fundamentals.
	 */

	static readonly type = 'Transformation'

	get type(): string {
		return (this.constructor as typeof Transformation).type
	}

	get matrix(): Matrix {
		return this._matrix.clone()
	}

	get translation(): Vector {
		return this._translation.clone()
	}

	clone(): Transformation {
		return new Transformation(this._matrix, this._translation)
	}

	toStorageValue(): TransformationData {
		return {
			matrix: this._matrix.toStorageValue(),
			translation: this._translation.toStorageValue(),
		}
	}

	get SO(): TransformationData { // SO legacy
		return this.toStorageValue()
	}

	static fromStorageValue(value: TransformationData): Transformation {
		return new Transformation(value)
	}

	/*
	 * Argument checks.
	 */

	private coerceTransformation(value: TransformationLike, dimension = this.dimension): Transformation {
		const transformation = new Transformation(value)
		if (transformation.dimension !== dimension) throw new Error(`Invalid Transformation dimension: expected a transformation of dimension ${dimension} but received a transformation of dimension ${transformation.dimension}.`)
		return transformation
	}

	/*
	 * Derived properties.
	 */

	get dimension(): number {
		return this._matrix.width
	}

	get determinant(): number {
		return this._matrix.determinant
	}

	get str(): string {
		return this.toString()
	}

	toString(): string {
		return `{ matrix: ${this._matrix.str}, translation: ${this._translation.str} }`
	}

	/*
	 * Checks.
	 */

	isInvertible(): boolean {
		return this._matrix.isInvertible()
	}

	isIdentity(): boolean {
		return this._matrix.isIdentity() && this._translation.isZero()
	}

	/*
	 * Comparisons.
	 */

	equals(transformation: TransformationLike): boolean {
		const other = this.coerceTransformation(transformation)
		return this._matrix.equals(other._matrix) && this._translation.equals(other._translation)
	}

	/*
	 * Operations.
	 */

	get inverse(): Transformation {
		if (!this.isInvertible()) throw new Error(`Invalid inverse call: cannot invert a non-invertible transformation.`)
		const inverseMatrix = this._matrix.inverse
		const inverseTranslation = inverseMatrix.multiply(this._translation).multiply(-1)
		return new Transformation(inverseMatrix, inverseTranslation)
	}

	// Set up the transformation obtained by applying this transformation and then the given one.
	then(nextTransformation: TransformationLike): Transformation {
		const next = this.coerceTransformation(nextTransformation)
		const matrix = next._matrix.multiply(this._matrix)
		const translation = next._matrix.multiply(this._translation)
		return new Transformation(matrix, translation.add(next._translation))
	}

	// Returns a new transformation applied relative to the given point.
	relativeTo(relativeTo: VectorLike = Vector.getZero(this.dimension)): Transformation {
		const origin = ensureVector(relativeTo, this.dimension)
		const translation = this._translation.add(origin).subtract(this._matrix.multiply(origin))
		return new Transformation(this._matrix, translation)
	}

	/*
	 * Transformations.
	 */

	transform(vector: VectorLike, preventTranslation?: boolean): Vector
	transform(line: LineLike, preventTranslation?: boolean): Line
	transform(lineSegment: LineSegmentLike, preventTranslation?: boolean): LineSegment
	transform(rectangle: RectangleLike, preventTranslation?: boolean): Rectangle
	transform(value: TransformableLike, preventTranslation = false): TransformableLike {
		// Transform a vector.
		if (isVectorLike(value)) {
			const vector = ensureVector(value, this.dimension)
			const transformedWithoutTranslation = this._matrix.multiply(vector)
			return preventTranslation ? transformedWithoutTranslation : transformedWithoutTranslation.add(this._translation)
		}

		// Transform a Line by transforming two points on it.
		if (isLineLike(value)) {
			const line = ensureLine(value, this.dimension)
			return Line.fromPoints(this.transform(line.start, preventTranslation), this.transform(line.secondPoint, preventTranslation))
		}

		// Transform a LineSegment by transforming its endpoints.
		if (isLineSegmentLike(value)) {
			const lineSegment = ensureLineSegment(value, this.dimension)
			return new LineSegment(this.transform(lineSegment.start, preventTranslation), this.transform(lineSegment.end, preventTranslation))
		}

		// Transform a Rectangle by transforming its min/max.
		if (isRectangleLike(value)) {
			const rectangle = ensureRectangle(value, this.dimension)
			if (!this.matrix.isMonomial()) throw new Error(`Invalid transform input: tried to transform a Rectangle using a matrix that is not monomial. The transformation will not be an axis-aligned Rectangle.`)
			return new Rectangle(this.transform(rectangle.min, preventTranslation), this.transform(rectangle.max, preventTranslation))
		}

		throw new Error(`Invalid transform input: expected a Vector, Line, LineSegment or Rectangle, but received something else.`)
	}

	/*
	 * Static creation methods.
	 */

	static getIdentity(dimension: number): Transformation {
		dimension = ensureInt(dimension, true)
		return new Transformation(Matrix.getIdentity(dimension), Vector.getZero(dimension))
	}

	static fromTranslation(translation: VectorLike): Transformation {
		const vector = ensureVector(translation)
		return new Transformation(Matrix.getIdentity(vector.dimension), vector)
	}

	static fromScale(scales: number[], relativeTo?: VectorLike): Transformation {
		const safeScales = scales.map(scale => ensureNumber(scale))
		const matrix = Matrix.fromDiagonal(safeScales)
		const translation = Vector.getZero(safeScales.length)
		return new Transformation(matrix, translation).relativeTo(relativeTo)
	}

	static fromUniformScale(scale: number, dimension: number, relativeTo?: VectorLike): Transformation {
		dimension = ensureInt(dimension, true)
		const safeScale = ensureNumber(scale)
		return Transformation.fromScale(new Array(dimension).fill(safeScale), relativeTo)
	}

	static fromRotation(rotation: number, relativeTo?: VectorLike): Transformation {
		const angle = ensureNumber(rotation)
		const matrix = new Matrix([[Math.cos(angle), -Math.sin(angle)], [Math.sin(angle), Math.cos(angle)]])
		return new Transformation(matrix, Vector.getZero(2)).relativeTo(relativeTo)
	}

	// Reflect along the given direction. Default: reflect along the x-axis.
	static fromReflection(direction: VectorLike = [1, 0], relativeTo?: VectorLike): Transformation {
		const axis = ensureVector(direction, undefined, false, true)

		// Reflection along axis u: transform using I - 2uu^T.
		const u = Matrix.fromVector(axis.normalize())
		const matrix = Matrix.getIdentity(axis.dimension).subtract(u.multiply(u.transpose()).multiply(2))
		return new Transformation(matrix, Vector.getZero(axis.dimension)).relativeTo(relativeTo)
	}
}
