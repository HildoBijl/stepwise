import { type Prefix, prefixes } from '../Prefix/index.ts'
import { type UnitDefinition, findUnitDefinition, specialUnitSymbols } from '../UnitDefinition/index.ts'

export const UnitFactorType = 'UnitFactor'
export type UnitFactorType = typeof UnitFactorType

export type UnitFactorStorageValue = {
	prefix?: string
	unit: string
	power?: number
}

export type UnitFactorParameters = {
	prefix?: Prefix
	unit: UnitDefinition
	power: number
}

export type UnitFactorInput = string | UnitFactorStorageValue | UnitFactorParameters

export const unitFactorBasePattern = `[a-zA-Z${specialUnitSymbols.join('')}]+`
export const unitFactorPattern = `(${unitFactorBasePattern})(\\^(\\d+))?`
export const unitFactorRegex = new RegExp(`^${unitFactorPattern}$`)

// Turn a string like 'muPa^3' into a UnitFactorParameters object.
export function parseUnitFactorString(str: string): UnitFactorParameters {
	// Check the input format.
	str = str.trim()
	if (str === '') throw new Error(`Invalid UnitFactor string given: could not parse an empty string.`)
	const match = unitFactorRegex.exec(str)
	if (!match) throw new Error(`Invalid UnitFactor string given: could not parse "${str}".`)

	// Check that we have known prefixes/units.
	const processedData = interpretPrefixAndUnitDefinitionString(match[1])
	if (!processedData.valid || !processedData.unit.obj) throw new Error(`Invalid UnitFactor string given: could not parse "${str}".`)

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
export type InterpretedPrefixAndUnitDefinitionString = {
	prefix: InterpretedUnitTextPart<Prefix>
	unit: InterpretedUnitTextPart<UnitDefinition>
	valid: boolean
}

// Turn a string like 'muPa' into an object with info on the recognized prefix, the recognized unit, and whether the combination is valid. On invalid units, the "valid" flag is false.
export function interpretPrefixAndUnitDefinitionString(text: string): InterpretedPrefixAndUnitDefinitionString {
	// If the string matches a full unit, give this unit.
	const directUnit = findUnitDefinition(text)
	if (directUnit) {
		return {
			prefix: { obj: undefined, str: '', original: '' },
			unit: { obj: directUnit, str: directUnit.symbol, original: text },
			valid: true,
		}
	}

	// There must be a prefix. If there is no matching prefix, note that there is no match.
	const matchingPrefixes = Object.values(prefixes).filter(prefix => !!prefix.findMatchingSymbol(text))
	if (matchingPrefixes.length === 0) {
		return {
			prefix: { obj: undefined, str: '', original: '' },
			unit: { obj: undefined, str: text, original: text },
			valid: false,
		}
	}

	// Find the prefixes for which the remainder is recognized as a unit.
	const prefixesWithUnits = matchingPrefixes.filter(prefix => {
		const unitStr = prefix.stripPrefix(text)
		return !!unitStr && !!findUnitDefinition(unitStr)
	})

	// On no valid unit, return the resulting prefix and faulty unit.
	if (prefixesWithUnits.length === 0) {
		const prefix = matchingPrefixes[0]
		const prefixStr = prefix.findMatchingSymbol(text) as string
		const unitStr = text.slice(prefixStr.length)
		return {
			prefix: { obj: prefix, str: prefix.symbol, original: prefixStr },
			unit: { obj: undefined, str: unitStr, original: unitStr },
			valid: false,
		}
	}

	// Remove the prefix from the string. Find the remaining unit.
	const prefix = prefixesWithUnits[0]
	const prefixStr = prefix.findMatchingSymbol(text) as string
	const unitStr = text.slice(prefixStr.length)
	const unit = findUnitDefinition(unitStr) as UnitDefinition
	return {
		prefix: { obj: prefix, str: prefix.symbol, original: prefixStr },
		unit: { obj: unit, str: unit ? unit.symbol : unitStr, original: unitStr },
		valid: true,
	}
}
