import { isPlainObject, onlyHasKeys } from '@step-wise/utils'

import { type UnitElement } from './UnitElement'

export type UnitElementInputValue = {
	text: string
	power?: string
}

export function isUnitElementInputValue(value: unknown): value is UnitElementInputValue {
	if (!isPlainObject(value) || !onlyHasKeys(value, ['text', 'power'])) return false
	const { text, power } = value as UnitElementInputValue
	return (typeof text === 'string') && (power === undefined || typeof power === 'string')
}

export function unitElementToInputValue(unitElement: UnitElement): UnitElementInputValue {
	return {
		text: unitElement.getStringWithoutPower(),
		...(unitElement.power === 1 ? {} : { power: unitElement.power.toString() }),
	}
}
