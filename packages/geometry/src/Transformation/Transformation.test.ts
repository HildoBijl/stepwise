import { describe, expect, it } from 'vitest'

import { Line, LineSegment, Matrix, Rectangle, Transformation, Vector, deserializeTransformation, ensureTransformation, isTransformable, isTransformationLike, serializeTransformation } from '..'

describe('Transformation', () => {
	it('constructs transformations and exposes their properties immutably', () => {
		const transformation = new Transformation([[2, 0], [0, 3]], [1, 2])
		expect(transformation.dimension).toBe(2)
		expect(transformation.determinant).toBe(6)
		expect(transformation.isInvertible()).toBe(true)
		expect(transformation.isIdentity()).toBe(false)
		expect(transformation.matrix.equals(new Matrix([[2, 0], [0, 3]]))).toBe(true)
		expect(transformation.translation.equals([1, 2])).toBe(true)
	})

	it('transforms vectors with optional translation', () => {
		const transformation = new Transformation([[2, 0], [0, 3]], [1, 2])
		expect(transformation.transform([2, 4]).coordinates).toEqual([5, 14])
		expect(transformation.transform([2, 4], { applyTranslation: false }).coordinates).toEqual([4, 12])
		expect(transformation.inverse.transform(transformation.transform([2, 4])).equals([2, 4])).toBe(true)
	})

	it('composes transformations and applies them around a point', () => {
		const translation = Transformation.fromTranslation([1, 0])
		const scale = Transformation.fromUniformScale(2, 2)
		expect(translation.then(scale).transform([1, 1]).coordinates).toEqual([4, 2])
		expect(scale.around([1, 1]).transform([2, 3]).coordinates).toEqual([3, 5])
	})

	it('transforms all supported geometry values', () => {
		const translation = Transformation.fromTranslation([1, 2])
		expect(translation.transform(new Line([0, 0], [1, 0])).start.coordinates).toEqual([1, 2])
		expect(translation.transform(new LineSegment([0, 0], [1, 1])).end.coordinates).toEqual([2, 3])
		expect(translation.transform(new Rectangle([0, 0], [2, 3])).min.coordinates).toEqual([1, 2])
		expect(() => Transformation.fromRotation(Math.PI / 4).transform(new Rectangle([0, 0], [1, 1]))).toThrow()
	})

	it('provides standard transformation factories', () => {
		expect(Transformation.getIdentity(3).isIdentity()).toBe(true)
		expect(Transformation.fromScale([2, 3]).transform([1, 1]).coordinates).toEqual([2, 3])
		expect(Transformation.fromRotation(Math.PI / 2).transform([1, 0]).equals([0, 1])).toBe(true)
		expect(Transformation.fromHyperplaneReflection([1, 0]).transform([2, 3]).equals([-2, 3])).toBe(true)
		expect(Transformation.fromHyperplaneReflection([0, 1]).transform([2, 3]).equals([2, -3])).toBe(true)
	})

	it('validates transformable values and transformations', () => {
		const transformation = Transformation.getIdentity(2)
		expect(isTransformationLike(transformation)).toBe(true)
		expect(isTransformable(new Vector(1, 2))).toBe(true)
		expect(isTransformable(new Line([0, 0], [1, 0]))).toBe(true)
		expect(ensureTransformation(transformation, { dimension: 2, invertible: true }).equals(transformation)).toBe(true)
		expect(() => ensureTransformation([[1, 0], [0, 0]], { invertible: true })).toThrow()
		expect(() => ensureTransformation(transformation, { dimension: 3 })).toThrow()
	})

	it('round-trips storage and serialized values', () => {
		const transformation = new Transformation([[2, 0], [0, 3]], [1, 2])
		expect(Transformation.fromStorageValue(transformation.toStorageValue()).equals(transformation)).toBe(true)
		expect(deserializeTransformation(serializeTransformation(transformation)).equals(transformation)).toBe(true)
		expect(() => deserializeTransformation({ type: 'Transformation', value: { matrix: [[1]], translation: [0] }, extra: true })).toThrow()
	})
})
