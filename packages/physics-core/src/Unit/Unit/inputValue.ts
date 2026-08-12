import { isPlainObject, onlyHasKeys, InterpretationError } from '@step-wise/utils'

import { type UnitElementStorageValue, type UnitElementInputValue, interpretPrefixAndBaseUnitString, isUnitElementInputValue, unitElementToInputValue } from '../UnitElement'

import { type UnitStorageValue } from './interpreting'
import { Unit } from './Unit'

export type UnitInputValue = {
	numerator?: UnitElementInputValue[]
	denominator?: UnitElementInputValue[]
}

/*
 * Type checks
 */

export function isUnitElementArrayInputValue(value: unknown): value is UnitElementInputValue[] {
	return Array.isArray(value) && value.every(isUnitElementInputValue)
}

export function isUnitInputValue(value: unknown): value is UnitInputValue {
	if (!isPlainObject(value) || !onlyHasKeys(value, ['numerator', 'denominator'])) return false
	const { numerator, denominator } = value as UnitInputValue
	return (numerator === undefined || isUnitElementArrayInputValue(numerator)) && (denominator === undefined || isUnitElementArrayInputValue(denominator))
}

/*
 * Interpretation
 */

export function interpretUnitInputValue(value: UnitInputValue): Unit {
	return new Unit(inputValueToStorageValue(value))
}

function inputValueToStorageValue(value: UnitInputValue): UnitStorageValue {
	return {
		...(value.numerator === undefined || value.numerator.length === 0 ? {} : { numerator: unitElementArrayInputValueToStorageValue(value.numerator) }),
		...(value.denominator === undefined || value.denominator.length === 0 ? {} : { denominator: unitElementArrayInputValueToStorageValue(value.denominator) }),
	}
}

function unitElementArrayInputValueToStorageValue(array: UnitElementInputValue[]): UnitElementStorageValue[] {
	return array.map((element, index) => unitElementInputValueToStorageValue(element))
}

function unitElementInputValueToStorageValue(element: UnitElementInputValue): UnitElementStorageValue {
	let { text, power } = element
	if (text === undefined || text.trim() === '') throw new InterpretationError(`Could not interpret an empty unit element.`, 'EmptyUnitElement')
	if (power === '-') throw new InterpretationError(`Could not interpret a unit power consisting of only a minus sign.`, 'MinusSign')

	// Parse the text.
	text = text.trim()
	const result = interpretPrefixAndBaseUnitString(text)
	if (!result.valid) throw new InterpretationError(`Could not interpret the unit with text "${text}".`, 'InvalidUnit')

	// Parse the power.
	power = power === undefined || power === '' ? '1' : power
	const parsedPower = parseInt(power)
	if (!Number.isInteger(parsedPower) || parsedPower <= 0) throw new InterpretationError(`Could not interpret a non-positive or invalid unit power.`, 'InvalidPower')

	// Assemble the StorageValue.
	return {
		...(result.prefix.str ? { prefix: result.prefix.str } : {}),
		unit: result.unit.str,
		...(parsedPower === 1 ? {} : { power: parsedPower }),
	}
}

/*
 * To input value
 */

export function unitToInputValue(unit: Unit): UnitInputValue {
	return {
		...(unit.numerator.length === 0 ? {} : { numerator: unit.numerator.map(unitElementToInputValue) }),
		...(unit.denominator.length === 0 ? {} : { denominator: unit.denominator.map(unitElementToInputValue) }),
	}
}
