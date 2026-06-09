import { ensureInt, isInt, roundToDigits } from '@step-wise/utils'

import { type FloatStorageValue, type FloatInput, FloatType, floatInputToStorageValue, getSignificantDigits } from './interpreting'
import { type FloatEqualityOptionsInput, type FloatEqualityResult, getNumberDirection, getRelativeDifference, resolveFloatEqualityOptions } from './comparison'
import { type TexDisplayOptionsInput, resolveTexDisplayOptions } from './texDisplayOptions'

export class Float {
	readonly number: number
	readonly significantDigits: number
	readonly power?: number

	/*
	 * Construction
	 */

	constructor(input: FloatInput) {
		const { number, significantDigits, power } = floatInputToStorageValue(input)
		this.number = number
		this.significantDigits = significantDigits
		this.power = power
	}

	/*
	 * Serialization
	 */

	get type(): FloatType {
		return FloatType
	}

	toStorageValue(): FloatStorageValue {
		return {
			number: this.number,
			significantDigits: this.significantDigits,
			...(this.power === undefined ? {} : { power: this.power }),
		}
	}

	/*
	 * Basic properties
	 */

	get decimals(): number {
		return this.significantDigits - Math.floor(Math.log10(Math.abs(this.number))) - 1
	}

	get sign(): number {
		return Math.sign(this.number)
	}

	/*
	 * Display
	 */

	get str(): string {
		return this.toString()
	}

	toString(): string {
		if (this.significantDigits === 0) return this.number === 0 ? '0' : '?'
		const power = this.getDisplayPower()
		let str = this.getDisplayNumber(power)
		if (str === '1' && power !== 0 && this.significantDigits === Infinity) return power > 0 ? `10^${power}` : `10^(${power})`
		if (power !== 0) str += power > 0 ? ` * 10^${power}` : ` * 10^(${power})`
		return str
	}

	get tex(): string {
		return this.toTex()
	}

	toTex(texDisplayOptions?: TexDisplayOptionsInput): string {
		if (this.significantDigits === 0) return this.number === 0 ? '0' : '?'
		const power = this.getDisplayPower()
		let str = this.getTexDisplayNumber(power, texDisplayOptions)
		if (str === '1' && power !== 0 && this.significantDigits === Infinity) return `10^{${power}}`
		if (power !== 0) str += ` \\cdot 10^{${power}}`
		return str
	}

	getDisplayPower(): number {
		if (this.power !== undefined) return this.power
		if (this.number === 0) return 0
		const number = roundToDigits(this.number, this.significantDigits)
		const power = Math.floor(Math.log10(Math.abs(number)))
		if (power === -1) return 0
		if (power > 0 && this.significantDigits > power) return 0
		return power
	}

	getDisplayNumber(power = this.getDisplayPower()): string {
		if (this.number === 0) return '0'
		const number = roundToDigits(this.number / Math.pow(10, power), this.significantDigits)
		let str = number.toString()
		const digitsToAdd = this.significantDigits - getSignificantDigits(str)
		if (digitsToAdd > 0 && digitsToAdd < Infinity) str += `${str.includes('.') ? '' : '.'}${'0'.repeat(digitsToAdd)}`
		return str
	}
	getTexDisplayNumber(power = this.getDisplayPower(), texDisplayOptions?: TexDisplayOptionsInput): string {
		const { decimalSeparator } = resolveTexDisplayOptions(texDisplayOptions)
		return this.getDisplayNumber(power).replace('.', decimalSeparator === ',' ? '{,}' : decimalSeparator)
	}

	get texWithPM(): string {
		return this.toTexWithPM()
	}
	toTexWithPM(texDisplayOptions?: TexDisplayOptionsInput): string {
		return `${this.number < 0 ? '' : '+'}${this.toTex(texDisplayOptions)}`
	}

	get texWithBrackets(): string {
		return this.toTexWithBrackets()
	}
	toTexWithBrackets(texDisplayOptions?: TexDisplayOptionsInput): string {
		return this.number < 0 || this.hasVisiblePower() ? `\\left(${this.toTex(texDisplayOptions)}\\right)` : this.toTex(texDisplayOptions)
	}

	hasVisiblePower(): boolean {
		if (this.significantDigits === 0) return false
		const power = this.getDisplayPower()
		if (power !== 0) return true
		return this.getDisplayNumber(power) === '1' && this.significantDigits === Infinity
	}

	/*
	 * Arithmetics
	 */

	negate(): Float {
		return new Float({ number: -this.number, significantDigits: this.significantDigits, power: this.power })
	}

	abs(): Float {
		return this.number < 0 ? new Float({ number: Math.abs(this.number), significantDigits: this.significantDigits, power: this.power }) : this
	}

	add(input: Float | FloatInput, keepDecimals = false): Float {
		const x = asFloat(input)
		const minDecimals = (keepDecimals ? Math.max : Math.min)(this.decimals, x.decimals)
		const number = this.number + x.number
		const significantDigits = number === 0 ? minDecimals + 1 : Math.max(Math.floor(Math.log10(Math.abs(number))) + minDecimals + 1, 1)
		return new Float({ number, significantDigits, power: this.power === x.power ? this.power : undefined })
	}

	subtract(input: Float | FloatInput, keepDecimals?: boolean): Float {
		return this.add(asFloat(input).negate(), keepDecimals)
	}

	multiply(input: Float | FloatInput, keepDigits = false): Float {
		const x = asFloat(input)
		return new Float({ number: this.number * x.number, significantDigits: (keepDigits ? Math.max : Math.min)(this.significantDigits, x.significantDigits) })
	}

	divide(input: Float | FloatInput, keepDigits?: boolean): Float {
		return this.multiply(asFloat(input).invert(), keepDigits)
	}

	invert(): Float {
		if (this.number === 0) throw new Error(`Invalid invert call: cannot invert zero. Dividing by zero is not allowed.`)
		return new Float({ number: 1 / this.number, significantDigits: this.significantDigits })
	}

	toPower(power: number | Float): Float {
		if (power instanceof Float) power = power.number
		if (this.number < 0 && !isInt(power)) throw new Error(`Invalid toPower call: cannot take a fractional power of a negative number.`)
		if (power === 0) return new Float({ number: 1, significantDigits: Infinity })
		if (power < 0) return this.invert().toPower(-power)
		return new Float({ number: Math.pow(this.number, power), significantDigits: this.significantDigits })
	}

	/*
	 * Precision operations
	 */

	setSignificantDigits(significantDigits: number): Float {
		significantDigits = ensureInt(significantDigits, true, false, true)
		return significantDigits === this.significantDigits ? this : new Float({ number: this.number, significantDigits, power: this.power })
	}

	// Set infinite significant digits.
	makeExact(): Float {
		return this.setSignificantDigits(Infinity)
	}

	// Shift significant digits up/down.
	adjustSignificantDigits(delta: number): Float {
		delta = ensureInt(delta)
		return this.setSignificantDigits(Math.max(this.significantDigits + delta, 0))
	}

	setMinimumSignificantDigits(significantDigits: number): Float {
		return this.setSignificantDigits(Math.max(significantDigits, this.significantDigits))
	}

	setDecimals(decimals: number): Float {
		decimals = ensureInt(decimals)
		const significantDigits = Math.floor(Math.log10(Math.abs(this.number)) + 1 + decimals)
		return this.setSignificantDigits(Math.max(significantDigits, 1))
	}

	// Round the number to equal the precision of its significant digits.
	roundToPrecision(): Float {
		return new Float({
			number: this.significantDigits === Infinity ? this.number : roundToDigits(this.number, this.significantDigits),
			significantDigits: this.significantDigits,
			power: this.power,
		})
	}

	// Set the format of this number to the default format: x.xxxx * 10^yy with only one non-zero digit prior to the comma. The number of significant digits is kept the same.
	clearDisplayPower(): Float {
		return new Float({
			number: this.number,
			significantDigits: this.significantDigits,
		})
	}

	/*
	 * Comparison
	 */

	compare(input: Float | FloatInput): -1 | 0 | 1 {
		return getNumberDirection(this.number, asFloat(input).number)
	}

	equals(input: Float | FloatInput, options?: FloatEqualityOptionsInput): boolean {
		return this.checkEquality(input, options).equal
	}

	checkEquality(input: Float | FloatInput, options?: FloatEqualityOptionsInput): FloatEqualityResult {
		const x = asFloat(input)
		const settings = resolveFloatEqualityOptions(options)

		// Check the number.
		const absoluteTolerance = Math.max(settings.absoluteTolerance, this.getMinAbsoluteTolerance())
		const absoluteDifference = Math.abs(x.number - this.number)
		const absoluteMatch = absoluteDifference <= absoluteTolerance
		const relativeDifference = getRelativeDifference(x.number, this.number)
		const relativeMatch = Math.sign(this.number) === Math.sign(x.number) && relativeDifference <= settings.relativeTolerance
		const numericEqual = absoluteMatch || relativeMatch

		// Check the significant digits.
		const significantDigitDifference = x.significantDigits - this.significantDigits
		const significantDigitsEqual = Math.abs(significantDigitDifference) <= settings.significantDigitTolerance

		// Assemble the result.
		const result: FloatEqualityResult = {
			equal: numericEqual && significantDigitsEqual,
			numeric: {
				equal: numericEqual,
				direction: getNumberDirection(x.number, this.number),
				absoluteDifference,
				absoluteTolerance,
				relativeDifference,
				relativeTolerance: settings.relativeTolerance,
			},
			significantDigits: {
				equal: significantDigitsEqual,
				difference: significantDigitDifference,
				tolerance: settings.significantDigitTolerance,
			},
		}

		// If needed, check the power.
		if (settings.checkPower) {
			const powerDifference = (x.power ?? 0) - (this.power ?? 0)
			const powerEqual = powerDifference === 0
			result.power = { equal: powerEqual, difference: powerDifference }
			if (!powerEqual) result.equal = false
		}

		return result
	}

	getMinAbsoluteTolerance() {
		return Math.pow(10, -this.decimals) / 2
	}
}

export function asFloat(input: Float | FloatInput): Float {
	return input instanceof Float ? input : new Float(input)
}
