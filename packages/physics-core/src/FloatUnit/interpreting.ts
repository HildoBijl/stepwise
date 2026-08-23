import { type FloatInput, type FloatStorageValue, Float, asFloat, floatPattern } from '../Float'
import { type UnitInput, type UnitStorageValue, Unit, asUnit, unitPattern } from '../Unit'

export const FloatUnitType = 'FloatUnit'
export type FloatUnitType = typeof FloatUnitType

export type FloatUnitStorageValue = {
	value: FloatStorageValue
	unit: UnitStorageValue
}

export type FloatUnitParameters = {
	value: Float
	unit: Unit
}

export type FloatUnitInput = string | number | Float | FloatUnitStorageValue | {
	value: FloatInput
	unit?: UnitInput
}

export const floatUnitPattern = `(${floatPattern})\\s*(${unitPattern})?`
export const floatUnitRegex = new RegExp(`^${floatUnitPattern}$`)

export function floatUnitInputToParameters(input: FloatUnitInput): FloatUnitParameters {
	if (input instanceof Float) return { value: input, unit: new Unit() }
	if (typeof input === 'number') return { value: new Float(input), unit: new Unit() }
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

export function floatUnitStorageValueToParameters(value: FloatUnitStorageValue | { value: FloatInput, unit?: UnitInput }): FloatUnitParameters {
	return {
		value: asFloat(value.value),
		unit: asUnit(value.unit ?? {}),
	}
}
