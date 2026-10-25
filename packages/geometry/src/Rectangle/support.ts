import { isPlainObject } from '@step-wise/js-utils'

import { type VectorLike, isVectorLike, Vector, ensureVector } from '../Vector/index.ts'

import type { RectangleCorners, RectangleInput, RectangleObject } from './types.ts'

export function isRectangleCorners(value: unknown): value is RectangleCorners {
	return Array.isArray(value) && value.length === 2 && isVectorLike(value[0]) && isVectorLike(value[1])
}

export function isRectangleObject(value: unknown): value is RectangleObject {
	if (!isPlainObject(value)) return false

	const hasMin = value.min !== undefined
	const hasMax = value.max !== undefined
	const hasSize = value.size !== undefined

	// A rectangle object must at least specify two of the three.
	const count = Number(hasMin) + Number(hasMax) + Number(hasSize)
	if (count < 2) return false
	if (hasMin && !isVectorLike(value.min)) return false
	if (hasMax && !isVectorLike(value.max)) return false
	if (hasSize && !isVectorLike(value.size)) return false
	return true
}

export function isRectangleInput(value: unknown): value is RectangleInput {
	return isRectangleCorners(value) || isRectangleObject(value)
}

export function getMinAndMax(start: VectorLike, end: VectorLike): [Vector, Vector] {
	const ensuredStart = ensureVector(start)
	const ensuredEnd = ensureVector(end, { dimension: ensuredStart.dimension })

	const min = new Vector(ensuredStart.coordinates.map((coordinate, axis) => Math.min(coordinate, ensuredEnd.getCoordinate(axis))))
	const max = new Vector(ensuredStart.coordinates.map((coordinate, axis) => Math.max(coordinate, ensuredEnd.getCoordinate(axis))))

	return [min, max]
}
