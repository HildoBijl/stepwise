import { ensureNumber } from '@step-wise/js-utils'
import { type TransformationLike, type VectorLike, Rectangle, Transformation, Vector, ensureTransformation, ensureVector, ensureVectorArray } from '@step-wise/geometry'

import type { AxisMargin, Margin, PointCollection, Scale } from './viewTypes.ts'

export type ResolvedScale = readonly [number, number]
export type ResolvedMargin = readonly [readonly [number, number], readonly [number, number]]

export function resolvePoints(points: PointCollection): Vector[] {
	const values: readonly VectorLike[] = Array.isArray(points) ? points : Object.values(points)
	return ensureVectorArray(values, { dimension: 2, nonEmpty: true })
}

export function resolveScale(scale: Scale = 1): ResolvedScale {
	const values = typeof scale === 'number' ? [scale, scale] : ensureVector(scale, { dimension: 2 }).coordinates
	const ensureScaleValue = (value: number) => ensureNumber(value, { nonNegative: true, nonZero: true })
	return [ensureScaleValue(values[0]), ensureScaleValue(values[1])]
}

export function resolveMargin(margin: Margin = 0): ResolvedMargin {
	if (typeof margin === 'number') {
		const value = ensureNumber(margin, { nonNegative: true })
		return [[value, value], [value, value]]
	}
	if (!Array.isArray(margin) || margin.length !== 2) throw new Error('Invalid Drawing view margin: expected a number or two axis margins.')
	return [resolveAxisMargin(margin[0]), resolveAxisMargin(margin[1])]
}

function resolveAxisMargin(margin: AxisMargin): readonly [number, number] {
	if (typeof margin === 'number') {
		const value = ensureNumber(margin, { nonNegative: true })
		return [value, value]
	}
	if (!Array.isArray(margin) || margin.length !== 2) throw new Error('Invalid Drawing view axis margin: expected a number or two side margins.')
	return margin.map(value => ensureNumber(value, { nonNegative: true })) as [number, number]
}

export function resolvePretransform(pretransform?: TransformationLike): Transformation {
	return ensureTransformation(pretransform ?? Transformation.getIdentity(2), { dimension: 2, invertible: true })
}

export function getPointBounds(points: readonly VectorLike[]): Rectangle {
	const vectors = ensureVectorArray(points, { dimension: 2, nonEmpty: true })
	const xValues = vectors.map(point => point.x)
	const yValues = vectors.map(point => point.y)
	return new Rectangle([Math.min(...xValues), Math.min(...yValues)], [Math.max(...xValues), Math.max(...yValues)])
}
