import { ensureString, isPlainObject } from '@step-wise/js-utils'
import { ensureVector } from '@step-wise/geometry'

import { createLoad } from '../loads'

import type { LoadName, NamedLoad, NamedLoadLike, NamedPoint, NamedPointLike } from './types'

export function createNamedPoint(point: NamedPointLike): NamedPoint {
	if (!isPlainObject(point)) throw new TypeError(`Invalid named point: expected a plain object.`)
	return {
		name: ensureString(point.name, true),
		position: ensureVector(point.position, 2),
	}
}

export function createLoadName(name: LoadName): LoadName {
	const result: LoadName = { symbol: ensureString(name.symbol, true) }
	if (name.point !== undefined) result.point = ensureString(name.point, true)
	if (name.suffix !== undefined) {
		if (typeof name.suffix !== 'string' && typeof name.suffix !== 'number') throw new TypeError(`Invalid load name suffix: expected a string or number, but received "${String(name.suffix)}".`)
		if (typeof name.suffix === 'string') ensureString(name.suffix, true)
		if (typeof name.suffix === 'number' && !Number.isFinite(name.suffix)) throw new TypeError(`Invalid load name suffix: expected a finite number, but received "${String(name.suffix)}".`)
		result.suffix = name.suffix
	}
	return result
}

export function createNamedLoad(namedLoad: NamedLoadLike): NamedLoad {
	if (!isPlainObject(namedLoad)) throw new TypeError(`Invalid named load: expected a plain object.`)
	return {
		load: createLoad(namedLoad.load),
		name: createLoadName(namedLoad.name),
	}
}
