import { isPlainObject, hasOnlyKeys } from '@step-wise/js-utils'

import { type UnitFactor } from './UnitFactor.ts'

export type UnitFactorInputValue = {
	text: string
	power?: string
}

export function isUnitFactorInputValue(value: unknown): value is UnitFactorInputValue {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['text', 'power'])) return false
	const { text, power } = value as UnitFactorInputValue
	return (typeof text === 'string') && (power === undefined || typeof power === 'string')
}

export function unitFactorToInputValue(unitFactor: UnitFactor): UnitFactorInputValue {
	return {
		text: unitFactor.getSymbol(),
		...(unitFactor.power === 1 ? {} : { power: unitFactor.power.toString() }),
	}
}
