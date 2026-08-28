import { ensureString, isPlainObject } from '@step-wise/js-utils'
import { ensureVector } from '@step-wise/geometry'

import { createLoad } from '../loads/index.ts'

import type { LoadName, NamedLoad, NamedLoadInput, NamedPoint, NamedPointInput } from './types.ts'
import { isLoadName, isNamedLoad, isNamedPoint } from './checks.ts'

export function createNamedPoint(point: NamedPointInput): NamedPoint {
	if (!isPlainObject(point)) throw new TypeError(`Invalid named point: expected a plain object.`)
	if (isNamedPoint(point) && Object.isFrozen(point)) return point
	return Object.freeze({
		name: ensureString(point.name, { nonEmpty: true }),
		position: ensureVector(point.position, { dimension: 2 }),
	})
}

export function createLoadName(name: LoadName): LoadName {
	if (!isPlainObject(name)) throw new TypeError(`Invalid load name: expected a plain object.`)
	if (isLoadName(name) && Object.isFrozen(name)) return name
	const result: { symbol: string, point?: string, suffix?: string | number } = { symbol: ensureString(name.symbol, { nonEmpty: true }) }
	if (name.point !== undefined) result.point = ensureString(name.point, { nonEmpty: true })
	if (name.suffix !== undefined) {
		if (typeof name.suffix !== 'string' && typeof name.suffix !== 'number') throw new TypeError(`Invalid load name suffix: expected a string or number, but received "${String(name.suffix)}".`)
		if (typeof name.suffix === 'string') ensureString(name.suffix, { nonEmpty: true })
		if (typeof name.suffix === 'number' && !Number.isFinite(name.suffix)) throw new TypeError(`Invalid load name suffix: expected a finite number, but received "${String(name.suffix)}".`)
		result.suffix = name.suffix
	}
	return Object.freeze(result)
}

export function createNamedLoad(namedLoad: NamedLoadInput): NamedLoad {
	if (!isPlainObject(namedLoad)) throw new TypeError(`Invalid named load: expected a plain object.`)
	if (isNamedLoad(namedLoad) && Object.isFrozen(namedLoad)) return namedLoad
	return Object.freeze({
		load: createLoad(namedLoad.load),
		name: createLoadName(namedLoad.name),
	})
}
