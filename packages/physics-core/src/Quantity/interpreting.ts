import { type PrecisionNumberInput, type PrecisionNumberStorageValue, PrecisionNumber, asPrecisionNumber, precisionNumberPattern } from '../PrecisionNumber'
import { type UnitInput, type UnitStorageValue, Unit, asUnit, unitPattern } from '../Unit'

export const QuantityType = 'Quantity'
export type QuantityType = typeof QuantityType

export type QuantityStorageValue = {
	value: PrecisionNumberStorageValue
	unit: UnitStorageValue
}

export type QuantityParameters = {
	value: PrecisionNumber
	unit: Unit
}

export type QuantityInput = string | number | PrecisionNumber | QuantityStorageValue | {
	value: PrecisionNumberInput
	unit?: UnitInput
}

export const quantityPattern = `(${precisionNumberPattern})\\s*(${unitPattern})?`
export const quantityRegex = new RegExp(`^${quantityPattern}$`)

export function quantityInputToParameters(input: QuantityInput): QuantityParameters {
	if (input instanceof PrecisionNumber) return { value: input, unit: new Unit() }
	if (typeof input === 'number') return { value: new PrecisionNumber(input), unit: new Unit() }
	if (typeof input === 'string') return quantityStorageValueToParameters(splitQuantityString(input))
	return quantityStorageValueToParameters(input)
}

export function splitQuantityString(str: string): { value: string, unit?: string } {
	str = str.trim()
	const match = quantityRegex.exec(str)
	if (!match) throw new Error(`Invalid Quantity string: could not parse "${str}".`)
	const value = match[1]
	const unit = str.slice(value.length).trim()
	return { value, unit }
}

export function quantityStorageValueToParameters(value: QuantityStorageValue | { value: PrecisionNumberInput, unit?: UnitInput }): QuantityParameters {
	return {
		value: asPrecisionNumber(value.value),
		unit: asUnit(value.unit ?? {}),
	}
}
