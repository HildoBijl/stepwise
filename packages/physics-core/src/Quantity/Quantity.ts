import { type TexDisplayOptionsInput, PrecisionNumber } from '../PrecisionNumber/index.ts'
import { type UnitLike, Unit, asUnit, unitsEquivalent } from '../Unit/index.ts'

import { type QuantityInput, type QuantityStorageValue, QuantityType, quantityInputToParameters } from './interpreting.ts'
import { type QuantitySimplificationOptionsInput, resolveQuantitySimplificationOptions } from './simplification.ts'
import { type QuantityEqualityOptionsInput, type QuantityEqualityResult, resolveQuantityEqualityOptions } from './comparison.ts'

export type QuantityLike = Quantity | QuantityInput

export function asQuantity(input: QuantityLike): Quantity {
	return input instanceof Quantity ? input : new Quantity(input)
}

export class Quantity {
	readonly value: PrecisionNumber
	readonly unit: Unit

	/*
	 * Construction
	 */

	constructor(input: QuantityInput) {
		const { value, unit } = quantityInputToParameters(input)
		this.value = value
		this.unit = unit
	}

	/*
	 * Serialization
	 */

	get type(): QuantityType {
		return QuantityType
	}

	toStorageValue(): QuantityStorageValue {
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

	mapPrecisionNumber(mapper: (value: PrecisionNumber) => PrecisionNumber): Quantity {
		return new Quantity({ value: mapper(this.value), unit: this.unit })
	}

	negate(): Quantity {
		return this.mapPrecisionNumber(value => value.negate())
	}

	abs(): Quantity {
		return this.mapPrecisionNumber(value => value.abs())
	}

	add(input: QuantityLike, keepDecimals = false): Quantity {
		const x = asQuantity(input).setUnit(this.unit)
		return new Quantity({ value: this.value.add(x.value, keepDecimals), unit: this.unit })
	}

	subtract(input: QuantityLike, keepDecimals = false): Quantity {
		return this.add(asQuantity(input).negate(), keepDecimals)
	}

	invert(): Quantity {
		return new Quantity({ value: this.value.invert(), unit: this.unit.invert() })
	}

	multiply(input: QuantityLike, keepDigits?: boolean, combineUnit = true): Quantity {
		const x = asQuantity(input)
		const value = this.value.multiply(x.value, keepDigits)
		let unit = this.unit.multiply(x.unit)
		if (combineUnit) unit = unit.combineLikeFactors()
		return new Quantity({ value, unit })
	}

	divide(input: QuantityLike, keepDigits?: boolean, combineUnit?: boolean): Quantity {
		return this.multiply(asQuantity(input).invert(), keepDigits, combineUnit)
	}

	toPower(power: number | PrecisionNumber | Quantity): Quantity {
		if (power instanceof Quantity && !unitsEquivalent(power.unit, '')) throw new Error(`Invalid toPower call: cannot raise a Quantity to a power containing a unit.`)
		const decimalExponent = power instanceof Quantity ? power.simplify().value : power
		const decimalExponentNumber = decimalExponent instanceof PrecisionNumber ? decimalExponent.number : decimalExponent
		return new Quantity({
			value: this.value.toPower(decimalExponentNumber),
			unit: this.unit.toPower(decimalExponentNumber),
		})
	}

	/*
	 * PrecisionNumber precision operations
	 */

	setSignificantDigits(significantDigits: number): Quantity {
		return this.mapPrecisionNumber(value => value.setSignificantDigits(significantDigits))
	}

	makeExact(): Quantity {
		return this.mapPrecisionNumber(value => value.makeExact())
	}

	adjustSignificantDigits(delta: number): Quantity {
		return this.mapPrecisionNumber(value => value.adjustSignificantDigits(delta))
	}

	setMinimumSignificantDigits(significantDigits: number): Quantity {
		return this.mapPrecisionNumber(value => value.setMinimumSignificantDigits(significantDigits))
	}

	setDecimals(decimals: number): Quantity {
		return this.mapPrecisionNumber(value => value.setDecimals(decimals))
	}

	roundToPrecision(): Quantity {
		return this.mapPrecisionNumber(value => value.roundToPrecision())
	}

	clearDisplayPower(): Quantity {
		return this.mapPrecisionNumber(value => value.clearDisplayPower())
	}

	setDisplayPower(power: number) {
		return this.mapPrecisionNumber(value => value.setDisplayPower(power))
	}

	/*
	 * Unit adjustments
	 */

	mapUnit(mapper: (unit: Unit) => Unit): Quantity {
		return new Quantity({ value: this.value, unit: mapper(this.unit) })
	}

	setUnit(input: UnitLike): Quantity {
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
		return new Quantity({ value, unit })
	}

	/*
	 * Simplification
	 */

	simplify(options?: QuantitySimplificationOptionsInput): Quantity {
		// Transform the unit.
		const { target, combine, sort, simplifyPrecisionNumber } = resolveQuantitySimplificationOptions(options)
		const { unit, decimalExponent, factor, offset } = this.unit.simplifyWithData({ target, combine, sort })

		// Adjust the value.
		let value = this.value
		if (offset !== 0) value = value.add({ number: offset, significantDigits: Infinity })
		if (factor !== 1) value = value.multiply({ number: factor, significantDigits: Infinity })
		if (decimalExponent !== 0) value = value.adjustPower(decimalExponent)
		if (simplifyPrecisionNumber) value = value.clearDisplayPower()

		// Assemble the outcome.
		return new Quantity({ value, unit })
	}

	/*
	 * Comparison
	 */

	compare(input: QuantityLike): -1 | 0 | 1 {
		const x = asQuantity(input)
		return this.value.compare(x.setUnit(this.unit).value)
	}

	equals(input: QuantityLike, options?: QuantityEqualityOptionsInput): boolean {
		return this.checkEquality(input, options).equal
	}

	checkEquality(input: QuantityLike, options?: QuantityEqualityOptionsInput): QuantityEqualityResult {
		const x = asQuantity(input)
		const equalityOptions = resolveQuantityEqualityOptions(options, this.value.getMinimumAbsoluteTolerance())

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
