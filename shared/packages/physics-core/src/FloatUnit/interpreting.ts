import { type FloatInput, type FloatStorageValue, Float, asFloat, floatPattern } from '../Float'
import { type UnitInput, type UnitStorageValue, Unit, asUnit, unitPattern } from '../Unit'

export const FloatUnitType = 'FloatUnit'
export type FloatUnitType = typeof FloatUnitType

export type FloatUnitStorageValue = {
	float: FloatStorageValue
	unit: UnitStorageValue
}

export type FloatUnitParameters = {
	float: Float
	unit: Unit
}

export type FloatUnitInput = string | number | Float | FloatUnitStorageValue | {
	float: FloatInput
	unit?: UnitInput
}

export const floatUnitPattern = `(${floatPattern})\\s*(${unitPattern})?`
export const floatUnitRegex = new RegExp(`^${floatUnitPattern}$`)

export function floatUnitInputToParameters(input: FloatUnitInput): FloatUnitParameters {
	if (input instanceof Float) return { float: input, unit: new Unit() }
	if (typeof input === 'number') return { float: new Float(input), unit: new Unit() }
	if (typeof input === 'string') return floatUnitStorageValueToParameters(splitFloatUnitString(input))
	return floatUnitStorageValueToParameters(input)
}

export function splitFloatUnitString(str: string): { float: string, unit?: string } {
	str = str.trim()
	const match = floatUnitRegex.exec(str)
	if (!match) throw new Error(`Invalid FloatUnit string: could not parse "${str}".`)
	const float = match[1]
	const unit = str.slice(float.length).trim()
	return { float, unit }
}

export function floatUnitStorageValueToParameters(value: FloatUnitStorageValue | { float: FloatInput, unit?: UnitInput }): FloatUnitParameters {
	return {
		float: asFloat(value.float),
		unit: asUnit(value.unit ?? {}),
	}
}
