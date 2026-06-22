import { type TexDisplayOptionsInput, Float } from '../Float'
import { type UnitLike, Unit, asUnit, unitsEquivalent } from '../Unit'

import { type FloatUnitInput, type FloatUnitStorageValue, FloatUnitType, floatUnitInputToParameters } from './interpreting'
import { type FloatUnitSimplificationOptionsInput, resolveFloatUnitSimplificationOptions } from './simplification'
import { type FloatUnitEqualityOptionsInput, type FloatUnitEqualityResult, resolveFloatUnitEqualityOptions } from './comparison'

export type FloatUnitLike = FloatUnit | FloatUnitInput

export function asFloatUnit(input: FloatUnitLike): FloatUnit {
	return input instanceof FloatUnit ? input : new FloatUnit(input)
}

export class FloatUnit {
	readonly float: Float
	readonly unit: Unit

	/*
	 * Construction
	 */

	constructor(input: FloatUnitInput) {
		const { float, unit } = floatUnitInputToParameters(input)
		this.float = float
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
			float: this.float.toStorageValue(),
			unit: this.unit.toStorageValue(),
		}
	}

	/*
	 * Basic properties
	 */

	get number(): number {
		return this.float.number
	}

	/*
	 * Display
	 */

	get str(): string {
		return this.toString()
	}

	toString(): string {
		return `${this.float.toString()}${this.unit.isEmpty() ? '' : ` ${this.unit.toString()}`}`
	}

	get tex(): string {
		return this.toTex()
	}

	toTex(texDisplayOptions?: TexDisplayOptionsInput): string {
		return `${this.float.toTex(texDisplayOptions)}${this.unit.isEmpty() ? '' : `\\ ${this.unit.toTex()}`}`
	}

	get texWithPM(): string {
		return this.toTexWithPM()
	}

	toTexWithPM(texDisplayOptions?: TexDisplayOptionsInput): string {
		return `${this.float.toTexWithPM(texDisplayOptions)}${this.unit.isEmpty() ? '' : `\\ ${this.unit.toTex()}`}`
	}

	/*
	 * Float arithmetics
	 */

	mapFloat(mapper: (float: Float) => Float): FloatUnit {
		return new FloatUnit({ float: mapper(this.float), unit: this.unit })
	}

	negate(): FloatUnit {
		return this.mapFloat(float => float.negate())
	}

	abs(): FloatUnit {
		return this.mapFloat(float => float.abs())
	}

	add(input: FloatUnitLike, keepDecimals = false): FloatUnit {
		const x = asFloatUnit(input).setUnit(this.unit)
		return new FloatUnit({ float: this.float.add(x.float, keepDecimals), unit: this.unit })
	}

	subtract(input: FloatUnitLike, keepDecimals = false): FloatUnit {
		return this.add(asFloatUnit(input).negate(), keepDecimals)
	}

	invert(): FloatUnit {
		return new FloatUnit({ float: this.float.invert(), unit: this.unit.invert() })
	}

	multiply(input: FloatUnitLike, keepDigits?: boolean): FloatUnit {
		const x = asFloatUnit(input)
		return new FloatUnit({
			float: this.float.multiply(x.float, keepDigits),
			unit: this.unit.multiply(x.unit),
		})
	}

	divide(input: FloatUnitLike, keepDigits?: boolean): FloatUnit {
		return this.multiply(asFloatUnit(input).invert(), keepDigits)
	}

	toPower(power: number | Float | FloatUnit): FloatUnit {
		if (power instanceof FloatUnit && !unitsEquivalent(power.unit, '')) throw new Error(`Invalid toPower call: cannot raise a FloatUnit to a power containing a unit.`)
		const exponent = power instanceof FloatUnit ? power.simplify().float : power
		const exponentNumber = exponent instanceof Float ? exponent.number : exponent
		return new FloatUnit({
			float: this.float.toPower(exponentNumber),
			unit: this.unit.toPower(exponentNumber),
		})
	}

	/*
	 * Float precision operations
	 */

	setSignificantDigits(significantDigits: number): FloatUnit {
		return this.mapFloat(float => float.setSignificantDigits(significantDigits))
	}

	makeExact(): FloatUnit {
		return this.mapFloat(float => float.makeExact())
	}

	adjustSignificantDigits(delta: number): FloatUnit {
		return this.mapFloat(float => float.adjustSignificantDigits(delta))
	}

	setMinimumSignificantDigits(significantDigits: number): FloatUnit {
		return this.mapFloat(float => float.setMinimumSignificantDigits(significantDigits))
	}

	setDecimals(decimals: number): FloatUnit {
		return this.mapFloat(float => float.setDecimals(decimals))
	}

	roundToPrecision(): FloatUnit {
		return this.mapFloat(float => float.roundToPrecision())
	}

	clearDisplayPower(): FloatUnit {
		return this.mapFloat(float => float.clearDisplayPower())
	}

	/*
	 * Unit adjustments
	 */

	mapUnit(mapper: (unit: Unit) => Unit): FloatUnit {
		return new FloatUnit({ float: this.float, unit: mapper(this.unit) })
	}

	setUnit(input: UnitLike): FloatUnit {
		// Check that the units match, and compare them.
		const unit = asUnit(input)
		if (!this.unit.equals(unit, { target: 'base', checkSize: false })) throw new Error(`Invalid unit given: cannot transform "${this.str}" to unit "${unit.str}". These units are not similar.`)
		const current = this.simplify({ target: 'standard', combine: true, sort: true, simplifyFloat: false })
		const targetData = unit.simplifyWithData({ target: 'standard', combine: true, sort: true })

		// Apply any differences to the float, and combine it with the given unit.
		let float = current.float
		if (targetData.exponent !== 0) float = float.adjustPower(-targetData.exponent)
		if (targetData.factor !== 1) float = float.divide({ number: targetData.factor, significantDigits: Infinity })
		if (targetData.difference !== 0) float = float.subtract({ number: targetData.difference, significantDigits: Infinity })
		return new FloatUnit({ float, unit })
	}

	/*
	 * Simplification
	 */

	simplify(options?: FloatUnitSimplificationOptionsInput): FloatUnit {
		// Transform the unit.
		const { target, combine, sort, simplifyFloat } = resolveFloatUnitSimplificationOptions(options)
		const { unit, exponent, factor, difference } = this.unit.simplifyWithData({ target, combine, sort })

		// Adjust the float.
		let float = this.float
		if (difference !== 0) float = float.add({ number: difference, significantDigits: Infinity })
		if (factor !== 1) float = float.multiply({ number: factor, significantDigits: Infinity })
		if (exponent !== 0) float = float.adjustPower(exponent)
		if (simplifyFloat) float = float.clearDisplayPower()

		// Assemble the outcome.
		return new FloatUnit({ float, unit })
	}

	/*
	 * Comparison
	 */

	compare(input: FloatUnitLike): -1 | 0 | 1 {
		const x = asFloatUnit(input)
		return this.float.compare(x.setUnit(this.unit).float)
	}

	equals(input: FloatUnitLike, options?: FloatUnitEqualityOptionsInput): boolean {
		return this.checkEquality(input, options).equal
	}

	checkEquality(input: FloatUnitLike, options?: FloatUnitEqualityOptionsInput): FloatUnitEqualityResult {
		const x = asFloatUnit(input)
		const equalityOptions = resolveFloatUnitEqualityOptions(options, this.float.getMinimumAbsoluteTolerance())

		// Check the unit.
		const unitResult = this.unit.checkEquality(x.unit, equalityOptions.unit)

		// Check the float.
		const simplificationOptions = { target: equalityOptions.unit.target, combine: true, sort: true, simplifyFloat: false }
		const inputSimplified = x.simplify(simplificationOptions)
		const referenceSimplified = this.simplify(simplificationOptions)
		const floatResult = referenceSimplified.float.checkEquality(inputSimplified.float, equalityOptions.float)

		// Run the respective comparisons.
		return {
			equal: floatResult.equal && unitResult.equal,
			float: floatResult,
			unit: unitResult,
		}
	}
}
