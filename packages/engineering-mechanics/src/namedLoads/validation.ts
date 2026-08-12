import { isPlainObject } from '@step-wise/utils'
import { Vector } from '@step-wise/geometry'

import { isLoad } from '../loads'

import type { LoadName, NamedLoad, NamedPoint } from './types'

export function isNamedPoint(value: unknown): value is NamedPoint {
	return isPlainObject(value) && typeof value.name === 'string' && value.name.length > 0 && value.position instanceof Vector && value.position.dimension === 2
}

export function isLoadName(value: unknown): value is LoadName {
	if (!isPlainObject(value) || typeof value.symbol !== 'string' || value.symbol.length === 0) return false
	if (value.point !== undefined && (typeof value.point !== 'string' || value.point.length === 0)) return false
	if (value.suffix !== undefined && !isValidSuffix(value.suffix)) return false
	return true
}

function isValidSuffix(value: unknown): value is string | number {
	return (typeof value === 'string' && value.length > 0) || (typeof value === 'number' && Number.isFinite(value))
}

export function isNamedLoad(value: unknown): value is NamedLoad {
	return isPlainObject(value) && isLoad(value.load) && isLoadName(value.name)
}
