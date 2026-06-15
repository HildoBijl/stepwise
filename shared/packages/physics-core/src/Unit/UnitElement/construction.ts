import { isInt, ensureInt, isPlainObject, onlyHasKeys } from '@step-wise/utils'

import { Prefix, findPrefix } from '../Prefix'
import { BaseUnit, findBaseUnit } from '../BaseUnit'

import { type UnitElementParameters, type UnitElementStorageValue, type UnitElementInput, parseUnitElementString } from './interpreting'

export function unitElementStorageValueToParameters(value: UnitElementStorageValue): UnitElementParameters {
	const prefix = value.prefix === undefined ? undefined : findPrefix(value.prefix)
	if (!prefix && typeof value.prefix === 'string' && value.prefix.length > 0) throw new Error(`Unknown prefix given: did not recognize prefix "${value.prefix}".`)

	const unit = findBaseUnit(value.unit)
	if (!unit) throw new Error(`Unknown unit given: did not recognize unit "${value.unit}".`)

	const power = ensureInt(value.power ?? 1, true, true)
	return { prefix, unit, power }
}

export function isUnitElementParameters(input: unknown): input is UnitElementParameters {
	if (!isPlainObject(input)) return false
	if (input.prefix !== undefined && !(input.prefix instanceof Prefix)) return false
	if (!(input.unit instanceof BaseUnit)) return false
	if (typeof input.power !== 'number' || !isInt(input.power) || input.power <= 0) return false
	if (!onlyHasKeys(input, ['prefix', 'unit', 'power'])) return false
	return true
}

export function unitElementInputToParameters(input: UnitElementInput): UnitElementParameters {
	if (typeof input === 'string') return parseUnitElementString(input)
	if (isUnitElementParameters(input)) return input
	return unitElementStorageValueToParameters(input)
}
