import { isInteger, ensureInteger, ensureString, isPlainObject, hasOnlyKeys } from '@step-wise/js-utils'

import { Prefix, findPrefix } from '../Prefix/index.ts'
import { UnitDefinition, findUnitDefinition } from '../UnitDefinition/index.ts'

import { type UnitFactorParameters, type UnitFactorStorageValue, type UnitFactorInput, parseUnitFactorString } from './interpreting.ts'

export function unitFactorStorageValueToParameters(value: UnitFactorStorageValue): UnitFactorParameters {
	value = ensureUnitFactorStorageValue(value)
	const prefix = value.prefix === undefined ? undefined : findPrefix(value.prefix)
	if (!prefix && typeof value.prefix === 'string' && value.prefix.length > 0) throw new Error(`Unknown prefix given: did not recognize prefix "${value.prefix}".`)

	const unit = findUnitDefinition(value.unit)
	if (!unit) throw new Error(`Unknown unit given: did not recognize unit "${value.unit}".`)

	const power = ensureInteger(value.power ?? 1, { nonNegative: true, nonZero: true })
	return { prefix, unit, power }
}

export function ensureUnitFactorStorageValue(value: unknown): UnitFactorStorageValue {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['prefix', 'unit', 'power'])) throw new TypeError(`Invalid UnitFactorStorageValue: expected an object containing only "prefix", "unit" and "power".`)
	const prefix = value.prefix === undefined ? undefined : ensureString(value.prefix)
	const unit = ensureString(value.unit, { nonEmpty: true })
	const power = value.power === undefined ? undefined : ensureInteger(value.power, { nonNegative: true, nonZero: true })
	return { prefix, unit, power }
}

export function isUnitFactorParameters(input: unknown): input is UnitFactorParameters {
	if (!isPlainObject(input)) return false
	if (input.prefix !== undefined && !(input.prefix instanceof Prefix)) return false
	if (!(input.unit instanceof UnitDefinition)) return false
	if (typeof input.power !== 'number' || !isInteger(input.power) || input.power <= 0) return false
	if (!hasOnlyKeys(input, ['prefix', 'unit', 'power'])) return false
	return true
}

export function unitFactorInputToParameters(input: UnitFactorInput): UnitFactorParameters {
	if (typeof input === 'string') return parseUnitFactorString(input)
	if (isUnitFactorParameters(input)) return input
	return unitFactorStorageValueToParameters(input)
}
