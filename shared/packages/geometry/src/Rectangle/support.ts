import { isPlainObject } from '@step-wise/utils'

import { type VectorLike, isVectorLike, Vector, ensureVector } from '../Vector'

import type { RectangleInput, RectangleObject, RectangleTuple } from './types'

export function isRectangleObject(value: unknown): value is RectangleObject {
	if (!isPlainObject(value)) return false
	const obj = value as Record<string, unknown>
	return isVectorLike(obj.start) && isVectorLike(obj.end)
}

export function isRectangleTuple(value: unknown): value is RectangleTuple {
	return Array.isArray(value) && value.length === 2 && isVectorLike(value[0]) && isVectorLike(value[1])
}

export function isRectangleInput(value: unknown): value is RectangleInput {
	return isRectangleObject(value) || isRectangleTuple(value)
}

export function getMinAndMax(start: VectorLike, end: VectorLike): [Vector, Vector] {
	const ensuredStart = ensureVector(start)
	const ensuredEnd = ensureVector(end, ensuredStart.dimension)

	const min = new Vector(ensuredStart.coordinates.map((coordinate, axis) => Math.min(coordinate, ensuredEnd.getCoordinate(axis))))
	const max = new Vector(ensuredStart.coordinates.map((coordinate, axis) => Math.max(coordinate, ensuredEnd.getCoordinate(axis))))

	return [min, max]
}
