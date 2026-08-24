import { ensureInteger, isInteger, compareNumbers, roundToDigits, checkNumberEquality } from '@step-wise/js-utils'

import { type PrecisionNumberStorageValue, type PrecisionNumberInput, PrecisionNumberType, precisionNumberInputToStorageValue, countSignificantDigits } from './interpreting'
import { type PrecisionNumberEqualityOptionsInput, type PrecisionNumberEqualityResult, resolvePrecisionNumberEqualityOptions, applyMinimumAbsoluteTolerance } from './comparison'
import { type TexDisplayOptionsInput, resolveTexDisplayOptions } from './texDisplayOptions'

export class PrecisionNumber {
	readonly number: number
	readonly significantDigits: number
	readonly power?: number

	/*
	 * Construction
	 */

	constructor(input: PrecisionNumberInput) {
		const { number, significantDigits, power } = precisionNumberInputToStorageValue(input)
		this.number = number
		this.significantDigits = significantDigits
		this.power = power
	}

	/*
	 * Serialization
	 */

	get type(): PrecisionNumberType {
		return PrecisionNumberType
	}

	toStorageValue(): PrecisionNumberStorageValue {
		return {
			number: this.number,
			significantDigits: this.significantDigits === Infinity ? 'Infinity' : this.significantDigits, // Work around JSON's inability to store Infinity.
			...(this.power === undefined ? {} : { power: this.power }),
		}
	}

	/*
	 * Basic properties
	 */

	get decimals(): number {
		if (this.number === 0) return this.significantDigits === Infinity ? Infinity : this.significantDigits - 1
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
		if (this.number === 0) return this.significantDigits === Infinity || this.significantDigits <= 1 ? '0' : `0.${'0'.repeat(this.significantDigits - 1)}`
		const number = roundToDigits(this.number / Math.pow(10, power), this.significantDigits)
		let str = number.toString()
		const digitsToAdd = this.significantDigits - countSignificantDigits(str)
		if (digitsToAdd > 0 && digitsToAdd < Infinity) str += `${str.includes('.') ? '' : '.'}${'0'.repeat(digitsToAdd)}`
		return str
	}
	getTexDisplayNumber(power = this.getDisplayPower(), texDisplayOptions?: TexDisplayOptionsInput): string {
		const { decimalSeparator } = resolveTexDisplayOptions(texDisplayOptions)
		return this.getDisplayNumber(power).replace('.', decimalSeparator === ',' ? '{,}' : decimalSeparator)
	}

	get texWithSign(): string {
		return this.toTexWithSign()
	}
	toTexWithSign(texDisplayOptions?: TexDisplayOptionsInput): string {
		return `${this.number < 0 ? '' : '+'}${this.toTex(texDisplayOptions)}`
	}

	get texWithParentheses(): string {
		return this.toTexWithParentheses()
	}
	toTexWithParentheses(texDisplayOptions?: TexDisplayOptionsInput): string {
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

	negate(): PrecisionNumber {
		return new PrecisionNumber({ number: -this.number, significantDigits: this.significantDigits, power: this.power })
	}

	abs(): PrecisionNumber {
		return this.number < 0 ? new PrecisionNumber({ number: Math.abs(this.number), significantDigits: this.significantDigits, power: this.power }) : this
	}

	add(input: PrecisionNumber | PrecisionNumberInput, keepDecimals = false): PrecisionNumber {
		const x = asPrecisionNumber(input)
		const minDecimals = (keepDecimals ? Math.max : Math.min)(this.decimals, x.decimals)
		const number = this.number + x.number
		const significantDigits = number === 0 ? minDecimals + 1 : Math.max(Math.floor(Math.log10(Math.abs(number))) + minDecimals + 1, 1)
		return new PrecisionNumber({ number, significantDigits, power: this.power === x.power ? this.power : undefined })
	}

	subtract(input: PrecisionNumber | PrecisionNumberInput, keepDecimals?: boolean): PrecisionNumber {
		return this.add(asPrecisionNumber(input).negate(), keepDecimals)
	}

	invert(): PrecisionNumber {
		if (this.number === 0) throw new Error(`Invalid invert call: cannot invert zero. Dividing by zero is not allowed.`)
		return new PrecisionNumber({ number: 1 / this.number, significantDigits: this.significantDigits })
	}

	multiply(input: PrecisionNumber | PrecisionNumberInput, keepDigits = false): PrecisionNumber {
		const x = asPrecisionNumber(input)
		return new PrecisionNumber({ number: this.number * x.number, significantDigits: (keepDigits ? Math.max : Math.min)(this.significantDigits, x.significantDigits) })
	}

	divide(input: PrecisionNumber | PrecisionNumberInput, keepDigits?: boolean): PrecisionNumber {
		return this.multiply(asPrecisionNumber(input).invert(), keepDigits)
	}

	adjustPower(delta: number): PrecisionNumber {
		delta = ensureInteger(delta)
		return new PrecisionNumber({ number: this.number * Math.pow(10, delta), power: this.power === undefined ? undefined : this.power + delta, significantDigits: this.significantDigits })
	}

	toPower(power: number | PrecisionNumber): PrecisionNumber {
		if (power instanceof PrecisionNumber) power = power.number
		if (this.number < 0 && !isInteger(power)) throw new Error(`Invalid toPower call: cannot take a fractional power of a negative number.`)
		if (power === 0) return new PrecisionNumber({ number: 1, significantDigits: Infinity })
		if (power < 0) return this.invert().toPower(-power)
		return new PrecisionNumber({ number: Math.pow(this.number, power), significantDigits: this.significantDigits })
	}

	/*
	 * Precision operations
	 */

	setSignificantDigits(significantDigits: number): PrecisionNumber {
		significantDigits = ensureInteger(significantDigits, { nonNegative: true, allowInfinity: true })
		return significantDigits === this.significantDigits ? this : new PrecisionNumber({ number: this.number, significantDigits, power: this.power })
	}

	// Set infinite significant digits.
	makeExact(): PrecisionNumber {
		return this.setSignificantDigits(Infinity)
	}

	// Shift significant digits up/down.
	adjustSignificantDigits(delta: number): PrecisionNumber {
		delta = ensureInteger(delta)
		return this.setSignificantDigits(Math.max(this.significantDigits + delta, 0))
	}

	setMinimumSignificantDigits(significantDigits: number): PrecisionNumber {
		return this.setSignificantDigits(Math.max(significantDigits, this.significantDigits))
	}

	setDecimals(decimals: number): PrecisionNumber {
		decimals = ensureInteger(decimals)
		const significantDigits = this.number === 0 ? decimals + 1 : Math.floor(Math.log10(Math.abs(this.number)) + 1 + decimals)
		return this.setSignificantDigits(Math.max(significantDigits, 0))
	}

	// Round the number to equal the precision of its significant digits.
	roundToPrecision(): PrecisionNumber {
		const number = this.significantDigits === Infinity ? this.number : roundToDigits(this.number, this.significantDigits)
		const magnitudeIncreased = number !== 0 && this.number !== 0 && Math.floor(Math.log10(Math.abs(number))) > Math.floor(Math.log10(Math.abs(this.number)))
		return new PrecisionNumber({
			number,
			significantDigits: this.significantDigits + (magnitudeIncreased ? 1 : 0),
			power: this.power,
		})
	}

	// Set the format of this number to the default format: x.xxxx * 10^yy with only one non-zero digit prior to the comma. The number of significant digits is kept the same.
	clearDisplayPower(): PrecisionNumber {
		return new PrecisionNumber({
			number: this.number,
			significantDigits: this.significantDigits,
		})
	}

	// Set the display power to a specific value.
	setDisplayPower(power: number): PrecisionNumber {
		power = ensureInteger(power)
		return new PrecisionNumber({
			number: this.number,
			significantDigits: this.significantDigits,
			power,
		})
	}

	/*
	 * Comparison
	 */

	compare(input: PrecisionNumber | PrecisionNumberInput): -1 | 0 | 1 {
		return compareNumbers(this.number, asPrecisionNumber(input).number)
	}

	equals(input: PrecisionNumber | PrecisionNumberInput, options?: PrecisionNumberEqualityOptionsInput): boolean {
		return this.checkEquality(input, options).equal
	}

	checkEquality(input: PrecisionNumber | PrecisionNumberInput, options?: PrecisionNumberEqualityOptionsInput): PrecisionNumberEqualityResult {
		const x = asPrecisionNumber(input)
		const { absoluteTolerance, relativeTolerance, significantDigitTolerance, checkPower } = resolvePrecisionNumberEqualityOptions(options, this.getMinimumAbsoluteTolerance())

		// Check the number.
		const number = checkNumberEquality(x.number, this.number, { absoluteTolerance, relativeTolerance })

		// Check the significant digits.
		const significantDigitDifference = x.significantDigits - this.significantDigits
		const significantDigitsEqual = Math.abs(significantDigitDifference) <= significantDigitTolerance

		// Assemble the result.
		const result: PrecisionNumberEqualityResult = {
			equal: number.equal && significantDigitsEqual,
			number,
			significantDigits: {
				equal: significantDigitsEqual,
				difference: significantDigitDifference,
				tolerance: significantDigitTolerance,
			},
		}

		// If needed, check the power.
		if (checkPower) {
			const powerDifference = x.getDisplayPower() - this.getDisplayPower()
			const powerEqual = powerDifference === 0
			result.power = { equal: powerEqual, difference: powerDifference }
			if (!powerEqual) result.equal = false
		}

		return result
	}

	getMinimumAbsoluteTolerance() {
		return Math.pow(10, -this.decimals) / 2
	}
}

export function asPrecisionNumber(input: PrecisionNumber | PrecisionNumberInput): PrecisionNumber {
	return input instanceof PrecisionNumber ? input : new PrecisionNumber(input)
}
