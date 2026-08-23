import { isInteger, ensureInteger, ensureString, isPlainObject, hasOnlyKeys } from '@step-wise/js-utils'

import { Prefix, findPrefix } from '../Prefix'
import { BaseUnit, findBaseUnit } from '../BaseUnit'

import { type UnitElementParameters, type UnitElementStorageValue, type UnitElementInput, parseUnitElementString } from './interpreting'

export function unitElementStorageValueToParameters(value: UnitElementStorageValue): UnitElementParameters {
	value = ensureUnitElementStorageValue(value)
	const prefix = value.prefix === undefined ? undefined : findPrefix(value.prefix)
	if (!prefix && typeof value.prefix === 'string' && value.prefix.length > 0) throw new Error(`Unknown prefix given: did not recognize prefix "${value.prefix}".`)

	const unit = findBaseUnit(value.unit)
	if (!unit) throw new Error(`Unknown unit given: did not recognize unit "${value.unit}".`)

	const power = ensureInteger(value.power ?? 1, { nonNegative: true, nonZero: true })
	return { prefix, unit, power }
}

export function ensureUnitElementStorageValue(value: unknown): UnitElementStorageValue {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['prefix', 'unit', 'power'])) throw new TypeError(`Invalid UnitElementStorageValue: expected an object containing only "prefix", "unit" and "power".`)
	const prefix = value.prefix === undefined ? undefined : ensureString(value.prefix)
	const unit = ensureString(value.unit, { nonEmpty: true })
	const power = value.power === undefined ? undefined : ensureInteger(value.power, { nonNegative: true, nonZero: true })
	return { prefix, unit, power }
}

export function isUnitElementParameters(input: unknown): input is UnitElementParameters {
	if (!isPlainObject(input)) return false
	if (input.prefix !== undefined && !(input.prefix instanceof Prefix)) return false
	if (!(input.unit instanceof BaseUnit)) return false
	if (typeof input.power !== 'number' || !isInteger(input.power) || input.power <= 0) return false
	if (!hasOnlyKeys(input, ['prefix', 'unit', 'power'])) return false
	return true
}

export function unitElementInputToParameters(input: UnitElementInput): UnitElementParameters {
	if (typeof input === 'string') return parseUnitElementString(input)
	if (isUnitElementParameters(input)) return input
	return unitElementStorageValueToParameters(input)
}
