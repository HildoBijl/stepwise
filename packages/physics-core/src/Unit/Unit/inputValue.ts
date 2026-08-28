import { isPlainObject, hasOnlyKeys, InterpretationError } from '@step-wise/js-utils'

import { type UnitFactorStorageValue, type UnitFactorInputValue, interpretPrefixAndUnitDefinitionString, isUnitFactorInputValue, unitFactorToInputValue } from '../UnitFactor/index.ts'

import { type UnitStorageValue } from './interpreting.ts'
import { Unit } from './Unit.ts'

export type UnitInputValue = {
	numerator?: UnitFactorInputValue[]
	denominator?: UnitFactorInputValue[]
}

/*
 * Type checks
 */

export function isUnitFactorArrayInputValue(value: unknown): value is UnitFactorInputValue[] {
	return Array.isArray(value) && value.every(isUnitFactorInputValue)
}

export function isUnitInputValue(value: unknown): value is UnitInputValue {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['numerator', 'denominator'])) return false
	const { numerator, denominator } = value as UnitInputValue
	return (numerator === undefined || isUnitFactorArrayInputValue(numerator)) && (denominator === undefined || isUnitFactorArrayInputValue(denominator))
}

/*
 * Interpretation
 */

export function interpretUnitInputValue(value: UnitInputValue): Unit {
	return new Unit(inputValueToStorageValue(value))
}

function inputValueToStorageValue(value: UnitInputValue): UnitStorageValue {
	return {
		...(value.numerator === undefined || value.numerator.length === 0 ? {} : { numerator: unitFactorArrayInputValueToStorageValue(value.numerator) }),
		...(value.denominator === undefined || value.denominator.length === 0 ? {} : { denominator: unitFactorArrayInputValueToStorageValue(value.denominator) }),
	}
}

function unitFactorArrayInputValueToStorageValue(array: UnitFactorInputValue[]): UnitFactorStorageValue[] {
	return array.map((element, index) => unitFactorInputValueToStorageValue(element))
}

function unitFactorInputValueToStorageValue(element: UnitFactorInputValue): UnitFactorStorageValue {
	let { text, power } = element
	if (text === undefined || text.trim() === '') throw new InterpretationError(`Could not interpret an empty unit factor.`, 'EmptyUnitFactor')
	if (power === '-') throw new InterpretationError(`Could not interpret a unit power consisting of only a minus sign.`, 'MinusSign')

	// Parse the text.
	text = text.trim()
	const result = interpretPrefixAndUnitDefinitionString(text)
	if (!result.valid) throw new InterpretationError(`Could not interpret the unit with text "${text}".`, 'InvalidUnit')

	// Parse the power.
	power = power === undefined || power === '' ? '1' : power
	if (!/^\d+$/.test(power)) throw new InterpretationError(`Could not interpret the unit power "${power}" as a positive integer.`, 'InvalidPower')
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
		...(unit.numerator.length === 0 ? {} : { numerator: unit.numerator.map(unitFactorToInputValue) }),
		...(unit.denominator.length === 0 ? {} : { denominator: unit.denominator.map(unitFactorToInputValue) }),
	}
}
