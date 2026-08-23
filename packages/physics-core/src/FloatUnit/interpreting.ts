import { type PrecisionNumberInput, type PrecisionNumberStorageValue, PrecisionNumber, asPrecisionNumber, precisionNumberPattern } from '../PrecisionNumber'
import { type UnitInput, type UnitStorageValue, Unit, asUnit, unitPattern } from '../Unit'

export const FloatUnitType = 'FloatUnit'
export type FloatUnitType = typeof FloatUnitType

export type FloatUnitStorageValue = {
	value: PrecisionNumberStorageValue
	unit: UnitStorageValue
}

export type FloatUnitParameters = {
	value: PrecisionNumber
	unit: Unit
}

export type FloatUnitInput = string | number | PrecisionNumber | FloatUnitStorageValue | {
	value: PrecisionNumberInput
	unit?: UnitInput
}

export const floatUnitPattern = `(${precisionNumberPattern})\\s*(${unitPattern})?`
export const floatUnitRegex = new RegExp(`^${floatUnitPattern}$`)

export function floatUnitInputToParameters(input: FloatUnitInput): FloatUnitParameters {
	if (input instanceof PrecisionNumber) return { value: input, unit: new Unit() }
	if (typeof input === 'number') return { value: new PrecisionNumber(input), unit: new Unit() }
	if (typeof input === 'string') return floatUnitStorageValueToParameters(splitFloatUnitString(input))
	return floatUnitStorageValueToParameters(input)
}

export function splitFloatUnitString(str: string): { value: string, unit?: string } {
	str = str.trim()
	const match = floatUnitRegex.exec(str)
	if (!match) throw new Error(`Invalid FloatUnit string: could not parse "${str}".`)
	const value = match[1]
	const unit = str.slice(value.length).trim()
	return { value, unit }
}

export function floatUnitStorageValueToParameters(value: FloatUnitStorageValue | { value: PrecisionNumberInput, unit?: UnitInput }): FloatUnitParameters {
	return {
		value: asPrecisionNumber(value.value),
		unit: asUnit(value.unit ?? {}),
	}
}
