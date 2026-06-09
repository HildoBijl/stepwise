import { type Prefix, prefixes } from '../Prefix'
import { type BaseUnit, findBaseUnit, specialUnitSymbols } from '../BaseUnit'

import { type UnitElementParameters } from './types'

export const unitElementPattern = `[a-zA-Z${specialUnitSymbols.join('')}]+`
export const unitElementRegex = new RegExp(`^(${unitElementPattern})(\\^(\\d+))?$`)

// Turn a string like 'muPa^3' into a UnitElementParameters object.
export function parseUnitElementString(str: string): UnitElementParameters {
	// Check the input format.
	str = str.trim()
	if (str === '') throw new Error(`Invalid UnitElement string given: could not parse an empty string.`)
	const match = unitElementRegex.exec(str)
	if (!match) throw new Error(`Invalid UnitElement string given: could not parse "${str}".`)

	// Check that we have known prefixes/units.
	const processedData = interpretPrefixAndBaseUnitString(match[1])
	if (!processedData.valid || !processedData.unit.obj) throw new Error(`Invalid UnitElement string given: could not parse "${str}".`)

	// Assemble the result.
	return {
		prefix: processedData.prefix.obj,
		unit: processedData.unit.obj,
		power: match[3] === undefined ? 1 : parseInt(match[3]),
	}
}

// Define types for the interpretation.
export type InterpretedUnitTextPart<T> = {
	obj?: T
	str: string
	original: string
}
export type InterpretedPrefixAndBaseUnitString = {
	prefix: InterpretedUnitTextPart<Prefix>
	unit: InterpretedUnitTextPart<BaseUnit>
	valid: boolean
}

// Turn a string like 'muPa' into an object with info on the recognized prefix, the recognized unit, and whether the combination is valid. On invalid units, the "valid" flag is false.
export function interpretPrefixAndBaseUnitString(text: string): InterpretedPrefixAndBaseUnitString {
	// If the string matches a full unit, give this unit.
	const directUnit = findBaseUnit(text)
	if (directUnit) {
		return {
			prefix: { obj: undefined, str: '', original: '' },
			unit: { obj: directUnit, str: directUnit.letter, original: text },
			valid: true,
		}
	}

	// There must be a prefix. If there is no matching prefix, note that there is no match.
	const matchingPrefixes = Object.values(prefixes).filter(prefix => !!prefix.getPrefixString(text))
	if (matchingPrefixes.length === 0) {
		return {
			prefix: { obj: undefined, str: '', original: '' },
			unit: { obj: undefined, str: text, original: text },
			valid: false,
		}
	}

	// Find the prefixes for which the remainder is recognized as a unit.
	const prefixesWithUnits = matchingPrefixes.filter(prefix => {
		const unitStr = prefix.getStringWithoutPrefix(text)
		return !!unitStr && !!findBaseUnit(unitStr)
	})

	// On no valid unit, return the resulting prefix and faulty unit.
	if (prefixesWithUnits.length === 0) {
		const prefix = matchingPrefixes[0]
		const prefixStr = prefix.getPrefixString(text) as string
		const unitStr = text.slice(prefixStr.length)
		return {
			prefix: { obj: prefix, str: prefix.letter, original: prefixStr },
			unit: { obj: undefined, str: unitStr, original: unitStr },
			valid: false,
		}
	}

	// Remove the prefix from the string. Find the remaining unit.
	const prefix = prefixesWithUnits[0]
	const prefixStr = prefix.getPrefixString(text) as string
	const unitStr = text.slice(prefixStr.length)
	const unit = findBaseUnit(unitStr) as BaseUnit
	return {
		prefix: { obj: prefix, str: prefix.letter, original: prefixStr },
		unit: { obj: unit, str: unit ? unit.letter : unitStr, original: unitStr },
		valid: true,
	}
}
