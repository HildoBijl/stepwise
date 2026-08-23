import { type TexDisplayOptionsInput, PrecisionNumber } from '../PrecisionNumber'
import { type UnitLike, Unit, asUnit, unitsEquivalent } from '../Unit'

import { type FloatUnitInput, type FloatUnitStorageValue, FloatUnitType, floatUnitInputToParameters } from './interpreting'
import { type FloatUnitSimplificationOptionsInput, resolveFloatUnitSimplificationOptions } from './simplification'
import { type FloatUnitEqualityOptionsInput, type FloatUnitEqualityResult, resolveFloatUnitEqualityOptions } from './comparison'

export type FloatUnitLike = FloatUnit | FloatUnitInput

export function asFloatUnit(input: FloatUnitLike): FloatUnit {
	return input instanceof FloatUnit ? input : new FloatUnit(input)
}

export class FloatUnit {
	readonly value: PrecisionNumber
	readonly unit: Unit

	/*
	 * Construction
	 */

	constructor(input: FloatUnitInput) {
		const { value, unit } = floatUnitInputToParameters(input)
		this.value = value
		this.unit = unit
	}

	/*
	 * Serialization
	 */

	get type(): FloatUnitType {
		return FloatUnitType
	}

	toStorageValue(): FloatUnitStorageValue {
		return {
			value: this.value.toStorageValue(),
			unit: this.unit.toStorageValue(),
		}
	}

	/*
	 * Basic properties
	 */

	get number(): number {
		return this.value.number
	}

	/*
	 * Display
	 */

	get str(): string {
		return this.toString()
	}

	toString(): string {
		return `${this.value.toString()}${this.unit.isEmpty() ? '' : ` ${this.unit.toString()}`}`
	}

	get tex(): string {
		return this.toTex()
	}

	toTex(texDisplayOptions?: TexDisplayOptionsInput): string {
		return `${this.value.toTex(texDisplayOptions)}${this.unit.isEmpty() ? '' : `\\ ${this.unit.toTex()}`}`
	}

	get texWithSign(): string {
		return this.toTexWithSign()
	}

	toTexWithSign(texDisplayOptions?: TexDisplayOptionsInput): string {
		return `${this.value.toTexWithSign(texDisplayOptions)}${this.unit.isEmpty() ? '' : `\\ ${this.unit.toTex()}`}`
	}

	/*
	 * PrecisionNumber arithmetics
	 */

	mapPrecisionNumber(mapper: (value: PrecisionNumber) => PrecisionNumber): FloatUnit {
		return new FloatUnit({ value: mapper(this.value), unit: this.unit })
	}

	negate(): FloatUnit {
		return this.mapPrecisionNumber(value => value.negate())
	}

	abs(): FloatUnit {
		return this.mapPrecisionNumber(value => value.abs())
	}

	add(input: FloatUnitLike, keepDecimals = false): FloatUnit {
		const x = asFloatUnit(input).setUnit(this.unit)
		return new FloatUnit({ value: this.value.add(x.value, keepDecimals), unit: this.unit })
	}

	subtract(input: FloatUnitLike, keepDecimals = false): FloatUnit {
		return this.add(asFloatUnit(input).negate(), keepDecimals)
	}

	invert(): FloatUnit {
		return new FloatUnit({ value: this.value.invert(), unit: this.unit.invert() })
	}

	multiply(input: FloatUnitLike, keepDigits?: boolean, combineUnit = true): FloatUnit {
		const x = asFloatUnit(input)
		const value = this.value.multiply(x.value, keepDigits)
		let unit = this.unit.multiply(x.unit)
		if (combineUnit) unit = unit.combineLikeFactors()
		return new FloatUnit({ value, unit })
	}

	divide(input: FloatUnitLike, keepDigits?: boolean, combineUnit?: boolean): FloatUnit {
		return this.multiply(asFloatUnit(input).invert(), keepDigits, combineUnit)
	}

	toPower(power: number | PrecisionNumber | FloatUnit): FloatUnit {
		if (power instanceof FloatUnit && !unitsEquivalent(power.unit, '')) throw new Error(`Invalid toPower call: cannot raise a FloatUnit to a power containing a unit.`)
		const decimalExponent = power instanceof FloatUnit ? power.simplify().value : power
		const decimalExponentNumber = decimalExponent instanceof PrecisionNumber ? decimalExponent.number : decimalExponent
		return new FloatUnit({
			value: this.value.toPower(decimalExponentNumber),
			unit: this.unit.toPower(decimalExponentNumber),
		})
	}

	/*
	 * PrecisionNumber precision operations
	 */

	setSignificantDigits(significantDigits: number): FloatUnit {
		return this.mapPrecisionNumber(value => value.setSignificantDigits(significantDigits))
	}

	makeExact(): FloatUnit {
		return this.mapPrecisionNumber(value => value.makeExact())
	}

	adjustSignificantDigits(delta: number): FloatUnit {
		return this.mapPrecisionNumber(value => value.adjustSignificantDigits(delta))
	}

	setMinimumSignificantDigits(significantDigits: number): FloatUnit {
		return this.mapPrecisionNumber(value => value.setMinimumSignificantDigits(significantDigits))
	}

	setDecimals(decimals: number): FloatUnit {
		return this.mapPrecisionNumber(value => value.setDecimals(decimals))
	}

	roundToPrecision(): FloatUnit {
		return this.mapPrecisionNumber(value => value.roundToPrecision())
	}

	clearDisplayPower(): FloatUnit {
		return this.mapPrecisionNumber(value => value.clearDisplayPower())
	}

	setDisplayPower(power: number) {
		return this.mapPrecisionNumber(value => value.setDisplayPower(power))
	}

	/*
	 * Unit adjustments
	 */

	mapUnit(mapper: (unit: Unit) => Unit): FloatUnit {
		return new FloatUnit({ value: this.value, unit: mapper(this.unit) })
	}

	setUnit(input: UnitLike): FloatUnit {
		// Check that the units match, and compare them.
		const unit = asUnit(input)
		if (this.unit.equals(unit, { target: 'unchanged', checkSize: true })) return this
		if (!this.unit.equals(unit, { target: 'base', checkSize: false })) throw new Error(`Invalid unit given: cannot transform "${this.str}" to unit "${unit.str}". These units are not similar.`)
		const current = this.simplify({ target: 'standard', combine: true, sort: true, simplifyPrecisionNumber: false })
		const targetData = unit.simplifyWithData({ target: 'standard', combine: true, sort: true })

		// Apply any offsets to the value, and combine it with the given unit.
		let value = current.value
		if (targetData.decimalExponent !== 0) value = value.adjustPower(-targetData.decimalExponent)
		if (targetData.factor !== 1) value = value.divide({ number: targetData.factor, significantDigits: Infinity })
		if (targetData.offset !== 0) value = value.subtract({ number: targetData.offset, significantDigits: Infinity })
		return new FloatUnit({ value, unit })
	}

	/*
	 * Simplification
	 */

	simplify(options?: FloatUnitSimplificationOptionsInput): FloatUnit {
		// Transform the unit.
		const { target, combine, sort, simplifyPrecisionNumber } = resolveFloatUnitSimplificationOptions(options)
		const { unit, decimalExponent, factor, offset } = this.unit.simplifyWithData({ target, combine, sort })

		// Adjust the value.
		let value = this.value
		if (offset !== 0) value = value.add({ number: offset, significantDigits: Infinity })
		if (factor !== 1) value = value.multiply({ number: factor, significantDigits: Infinity })
		if (decimalExponent !== 0) value = value.adjustPower(decimalExponent)
		if (simplifyPrecisionNumber) value = value.clearDisplayPower()

		// Assemble the outcome.
		return new FloatUnit({ value, unit })
	}

	/*
	 * Comparison
	 */

	compare(input: FloatUnitLike): -1 | 0 | 1 {
		const x = asFloatUnit(input)
		return this.value.compare(x.setUnit(this.unit).value)
	}

	equals(input: FloatUnitLike, options?: FloatUnitEqualityOptionsInput): boolean {
		return this.checkEquality(input, options).equal
	}

	checkEquality(input: FloatUnitLike, options?: FloatUnitEqualityOptionsInput): FloatUnitEqualityResult {
		const x = asFloatUnit(input)
		const equalityOptions = resolveFloatUnitEqualityOptions(options, this.value.getMinimumAbsoluteTolerance())

		// Check the unit.
		const unitResult = this.unit.checkEquality(x.unit, equalityOptions.unit)

		// Check the value.
		const simplificationOptions = { target: equalityOptions.unit.target, combine: true, sort: true, simplifyPrecisionNumber: false }
		const inputSimplified = x.simplify(simplificationOptions)
		const referenceSimplified = this.simplify(simplificationOptions)
		const precisionNumberResult = referenceSimplified.value.checkEquality(inputSimplified.value, equalityOptions.value)

		// Run the respective comparisons.
		return {
			equal: precisionNumberResult.equal && unitResult.equal,
			value: precisionNumberResult,
			unit: unitResult,
		}
	}
}
