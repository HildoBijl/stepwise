// The Float class represents floating point numbers with a certain number of significant digits. By default it is an empty string with zero significant digits.

const { isInt, ensureInt, isNumber, ensureNumber, roundToDigits, isObject, processOptions, keysToObject } = require('../../util')
const { decimalSeparator } = require('../../settings/numbers')

const { getSignificantDigits, stringToSO, numberToSO } = require('./util')

const defaultParameters = {
	number: 0,
	significantDigits: Infinity,
	power: undefined, // Solely for display purposes. 0 means a number like "1234.56" will be display as "1234.56", 2 means a number like "1234.56" will be displayed as "12.3456 * 10^2", and undefined means we'll just make our own best guess as how we should display this number.
}

class Float {
	/* The constructor input can be of the form string, number or SO.
	 * string: A string of the form "123.456 * 10^(-2)" (the power is optional, and so are the brackets). The significant digits and power will be interpreted from the string.
	 * number: A number like 12.345. Significant digits will be deduced from whatever is given. So for 12.345 it'll be five. No trailing zeros are possible in this input form.
	 * SO: An object with parameters
		 * number (default 0): the number that we have.
		 * significantDigits (default Infinity): the number of significant digits of the unit. 
		 * power (default undefined): the power that is used when displaying the number. A number like 1234.56 with power 2 will be displayed as 12.3456 * 10^2. Keeping undefined means we'll just make our own best guess as how we should display this number. This is better, as a number like 1200 with two significant digits will be displayed like "1.2" with undefined power, but "1200" (wrong) with zero power.
	 */
	constructor(input = {}) {
		// If we have a type Float, just use it.
		if (isObject(input) && input.constructor === Float)
			return input

		// If we have a string or number, split it up into an object first.
		if (typeof input === 'string')
			input = stringToSO(input)
		else if (typeof input === 'number')
			input = numberToSO(input)

		// Include default values.
		const { number, significantDigits, power } = processOptions(input, defaultParameters)

		// Process the number.
		if (!isNumber(number))
			throw new Error(`Invalid input: a Float number should as parameter receive an object with a numeric number parameter. Instead it received "${JSON.stringify(input)}".`)
		this._number = parseFloat(number)

		// Process the significant digits.
		if (!isInt(significantDigits) || significantDigits < 0)
			throw new Error(`Invalid input: a Float number should as parameter receive an object with a non-negative integer as significantDigits parameter. Instead it received "${JSON.stringify(input)}".`)
		this._significantDigits = significantDigits

		// Process the power.
		if (power !== undefined && !isInt(power))
			throw new Error(`Invalid input: a Float number should as parameter receive an object with an integer as power parameter. Instead it received "${JSON.stringify(input)}".`)
		this._power = typeof power === 'string' ? parseInt(power) : power
	}

	// SO returns a storage object representation of this float number that can be interpreted again.
	get SO() {
		return keysToObject(Object.keys(defaultParameters), key => this[key] === defaultParameters[key] ? undefined : this[key])
	}

	get SI() {
		const power = this.getDisplayPower()
		const result = { number: this.getDisplayNumber(power) }
		if (power !== 0)
			result.power = power.toString()
		return result
	}

	get type() {
		return 'Float'
	}

	// number returns the float number as a number. So it's not 314.159 * 10^(-2) but it's 3.14159.
	get number() {
		return this._number
	}

	get significantDigits() {
		return this._significantDigits
	}

	get power() {
		return this._power
	}

	get decimals() {
		return this.significantDigits - Math.floor(Math.log10(Math.abs(this.number))) - 1
	}

	// str returns a string representation of this number.
	get str() {
		return this.toString()
	}

	// toString returns a string representation of this number.
	toString() {
		// Check boundary cases.
		if (this._significantDigits === 0)
			return this._number === 0 ? '0' : '?'

		// Determine the power that's used for string display and use it to determine the corresponding string.
		const power = this.getDisplayPower()
		let str = this.getDisplayNumber(power)

		// Check a special case.
		if (str === '1' && power !== 0 && this._significantDigits === Infinity)
			return power > 0 ? `10^${power}` : `10^(${power})`

		// Add a power display.
		if (power !== 0) {
			if (power > 0) {
				str += ` * 10^${power}`
			} else {
				str += ` * 10^(${power})`
			}
		}
		return str
	}

	// hasVisiblePower returns if there is a power visible in the display of this number. It is based on the toString method and the tex method.
	hasVisiblePower() {
		if (this._significantDigits === 0)
			return false

		const power = this.getDisplayPower()
		if (power !== 0)
			return true

		const str = this.getDisplayNumber(power)
		if (str === '1' && this._significantDigits === Infinity)
			return true

		return false
	}

	get tex() {
		// Check boundary cases.
		if (this._significantDigits === 0)
			return this._number === 0 ? '0' : '?'

		// Determine the power that's used for string display and use it to determine the corresponding string.
		const power = this.getDisplayPower()
		let str = this.getDisplayNumber(power)

		// Check a special case.
		if (str === '1' && power !== 0 && this._significantDigits === Infinity)
			return `10^{${power}}`

		// Replace a period by the decimal separator.
		const replacement = decimalSeparator === ',' ? '{,}' : decimalSeparator
		str = str.replace('.', replacement)

		// Add a power display.
		if (power !== 0) {
			str += ` \\cdot 10^{${power}}`
		}
		return str
	}

	// texWithPM will return latex code but then with a plus or minus prior to the number, so it can be used as a term in an equation. For "5" it will return "+5", for "-5" it will return "-5" and for "0" it returns "+0".
	get texWithPM() {
		return (this.number < 0 ? '' : '+') + this.tex
	}

	// texWithBrackets will return latex code, but then with brackets if this is a negative number or if there is a visible power in the display.
	get texWithBrackets() {
		return (this.number < 0 || this.hasVisiblePower() ? `\\left(${this.tex}\\right)` : this.tex)
	}

	// getDisplayPower returns the power with which we want to display the number. If the power is known, it is returned. Otherwise we intelligently determine one. It is returned as an integer number (not a string).
	getDisplayPower() {
		// If the power is set, just return that.
		if (this._power !== undefined)
			return this._power

		// Check boundary case.
		if (this._number === 0)
			return 0

		// No power is set. Let's intelligently determine one. We do round the number first, or a number like "9.8" might give a wrong result.
		const number = roundToDigits(this.number, this.significantDigits)
		const power = Math.floor(Math.log10(Math.abs(number))) // This is the power that we need to get a number of the form "x.xxx" (with one decimal before the point).

		if (power === -1)
			return 0 // Display a number like 3 * 10^(-1) as 0.3.
		if (power > 0 && this._significantDigits > power)
			return 0 // Display a number like 1.2 * 10^1 as 12, or a number like 2.7315 * 10^2 as 273.15.
		return power
	}

	// getDisplayNumber returns a string representation for the number as it is displayed. This is done for the given power.
	getDisplayNumber(power) {
		// Check boundary case.
		if (this._number === 0)
			return '0'

		// Round the number to the right number of significant digits, taking into account the power that will later be added.
		const number = roundToDigits(this._number / Math.pow(10, power || 0), this.significantDigits)

		// Add zeros to the end if needed to match the significant digits.
		let str = number.toString()
		const digitsToAdd = this._significantDigits - getSignificantDigits(str)
		if (digitsToAdd > 0 && digitsToAdd < Infinity) // If needed, add zeros to build up to the right amount of digits. Add a period too if there is none yet.
			str += (str.indexOf('.') === -1 ? '.' : '') + '0'.repeat(digitsToAdd)

		// All done!
		return str
	}

	set significantDigits(significantDigits) {
		if (!isInt(significantDigits) || significantDigits < 0)
			throw new Error(`Invalid significantDigits: the number of significant digits should be a non-negative integer, but "${significantDigits}" was given.`)
		this._significantDigits = significantDigits
	}

	set power(power) {
		if (power !== undefined && !isInt(power))
			throw new Error(`Invalid power: a power should be an integer (or undefined) but "${power}" was given.`)
		this._power = power
	}

	// makeExact sets the number of significant digits to Infinity, indicating we know this number with full precision. It does not adjust this object but returns a copy.
	makeExact() {
		return new Float({
			number: this.number,
			power: this.power,
			significantDigits: Infinity,
		})
	}

	// adjustSignificantDigits increases the number of significant digits by the given delta. (Cannot be decreased below zero: will be capped then.) The original object is not adjusted.
	adjustSignificantDigits(delta) {
		delta = ensureInt(delta)
		return this.setSignificantDigits(Math.max(this.significantDigits + delta, 0))
	}

	// setSignificantDigits returns a copy of this number but then with the given number of significant digits.
	setSignificantDigits(significantDigits) {
		significantDigits = ensureInt(significantDigits, true)
		return new Float({
			number: this.number,
			power: this.power,
			significantDigits: significantDigits,
		})
	}

	// setMinimumSignificantDigits returns a copy in which the significant digits is increased to the given amount, if currently less.
	setMinimumSignificantDigits(significantDigits) {
		return this.setSignificantDigits(Math.max(significantDigits, this.significantDigits))
	}

	// setDecimals returns a copy of this number but then with the number of significant digits adjusted to ensure it has the given number of decimals. You can use "-2" to ensure a number like "1234" is shown like "1.2 * 10^3". It bounds it to show at least one digit. So if "1234" is shown with -6 decimals, then it's shown as "1 * 10^3".
	setDecimals(decimals) {
		decimals = ensureInt(decimals)
		const significantDigits = Math.floor(Math.log10(Math.abs(this.number)) + 1 + decimals) // Find the necessary number of significant digits.
		return this.setSignificantDigits(Math.max(significantDigits, 1)) // Bound to at least one significant digit.
	}

	// simplify sets the format of this number to the default format: x.xxxx * 10^yy. So there's only one non-zero digit prior to the comma. The number of significant digits is kept the same. It does not adjust this object but returns a copy.
	simplify() {
		return new Float({
			number: this.number,
			significantDigits: this.significantDigits,
			// Leave power undefined.
		})
	}

	// compare receives a Float object and checks which one is bigger. If this object is bigger, then 1 is returned. If the other one is bigger, -1 is returned. If the size is equal, 0 is given.
	compare(x) {
		// If constructors don't match, no comparison is possible.
		if (this.constructor !== x.constructor)
			throw new Error(`Invalid comparison: cannot compare a number of type "${this.constructor.name || 'unknown'}" with a number of type "${x.constructor.name || 'unknown'}".`)

		// Compare the numbers.
		const a = this.number
		const b = x.number
		return (a > b ? 1 : (a < b ? -1 : 0))
	}

	// equals compares two Floats. It only returns true or false.
	equals(x, options = {}) {
		return this.checkEquality(x, options).result
	}

	/* checkEquality compares the given float with the this-float. Options include:
	 * - absoluteMargin (default 'auto'): the absolute margin that is allowed. If 0.05 is given, then 5.00 will be equal to numbers betwee 4.95 and 5.05 (inclusive). If it equals 'auto', then it will adjust to the accuracy of this float. If this float has value "1.60", then the absolute margin will be 0.005, so that all numbers between 1.595 and 1.605 are valid. Keeping this auto option is highly recommended: taking a small absoluteMargin and a strict significantDigit limit might result in impossible questions.
	 * - relativeMargin (default 0.000001 to prevent numerical issues): the relative margin between the numbers. If 0.01 is given, a 1% margin is used. So then the number 5.00 is considered equal to numbers between 4.95 and 5.0505... (Always the largest number is used to determine margins.) If both a relative and an absolute margin are given, then the numbers are considered equal when one of the margins match. (That is: in doubtful situations, equality is usually set to true.)
	 * - accuracyFactor (default 1): a factor through which both margins (absolute and relative) can be expanded. If this factor is set to 3, then all margins are tripled and equality is more easily obtained. This is useful to check if the student was close with his answer but not exactly on the spot.
	 * - significantDigitMargin (default Infinity): the allowed difference in the number of significant digits. Is 001.0 (two sig. digits) the same as 1.000 (four sig. digits)?
	 * - checkPower (default false): requires the power of the numbers to be equal too. When set to true, 123.4 and 1.234 * 10^2 are considered different units.
	 * The result is an object containing information.
	 * - result (true or false): is there equality?
	 * - magnitude ('TooSmall','TooLarge','OK')
	 * - numSignificantDigits ('TooSmall','TooLarge','OK') only when this is checked.
	 * - power ('TooSmall','TooLarge','OK') only when this is checked.
	 * - absoluteMarginOK (true or false)
	 * - relativeMarginOK (true or false)
	 */
	checkEquality(x, options = {}) {
		// If constructors don't match, no comparison is possible.
		if (this.constructor !== x.constructor)
			throw new Error(`Invalid comparison: cannot compare a number of type "${this.constructor.name || 'unknown'}" with a number of type "${x.constructor.name || 'unknown'}".`)

		// Check the options.
		options = processOptions(options, Float.defaultComparison)
		if (options.absoluteMargin !== 'auto' && (!isNumber(options.absoluteMargin) || options.absoluteMargin < 0))
			throw new Error(`Invalid options: the parameter absoluteMargin must be a non-negative number (or 'auto') but "${options.absoluteMargin}" was given.`)
		if (!isNumber(options.relativeMargin) || options.relativeMargin < 0)
			throw new Error(`Invalid options: the parameter relativeMargin must be a non-negative number, but "${options.relativeMargin}" was given.`)
		if (!isNumber(options.accuracyFactor) || options.accuracyFactor < 0)
			throw new Error(`Invalid options: the parameter accuracyFactor must be a non-negative number, but "${options.accuracyFactor}" was given.`)
		if (options.significantDigitMargin !== Infinity && (!isInt(options.significantDigitMargin) || options.significantDigitMargin < 0))
			throw new Error(`Invalid options: the parameter significantDigitMargin must be a non-negative integer, but "${options.significantDigitMargin}" was given.`)

		// Check the values, by seeing if one of the given margins matches out.
		const result = { result: true } // Assume equality.
		const n1 = this.number
		const n2 = x.number
		const minAbsoluteMargin = Math.pow(10, -this.decimals) / 2 // The accuracy that is obtained through the significant digits.
		const absoluteMargin = (options.absoluteMargin === 'auto' ? minAbsoluteMargin : Math.max(options.absoluteMargin * options.accuracyFactor, minAbsoluteMargin))
		const relativeMargin = options.relativeMargin * options.accuracyFactor
		if (n1 >= n2 - absoluteMargin && n1 <= n2 + absoluteMargin) {
			result.absoluteMarginOK = true
			result.magnitude = 'OK'
		} else if (Math.sign(n1) === Math.sign(n2) && Math.abs(n1) >= Math.abs(n2) * (1 - relativeMargin) && Math.abs(n1) <= Math.abs(n2) / (1 - relativeMargin)) {
			result.relativeMarginOK = true
			result.magnitude = 'OK'
		} else { // No equality.
			result.result = false
			result.magnitude = (n2 < n1 ? 'TooSmall' : 'TooLarge')
		}

		// Check the number of significant digits.
		result.numSignificantDigits = 'OK'
		if (Math.abs(this.significantDigits - x.significantDigits) > options.significantDigitMargin) {
			result.result = false // No equality.
			result.numSignificantDigits = (x.significantDigits < this.significantDigits ? 'TooSmall' : 'TooLarge')
		}

		// Check powers of the numbers.
		if (options.checkPower) {
			result.power = 'OK'
			if (this.power !== x.power) {
				result.result = false
				result.power = (x.power < this.power ? 'TooSmall' : 'TooLarge')
			}
		}

		// No difference found.
		return result
	}

	get sign() {
		return Math.sign(this.number)
	}

	// applyMinus will return minus this number. It does not adjust this object but returns a copy.
	applyMinus() {
		return new Float({
			number: -this.number,
			power: this.power,
			significantDigits: this.significantDigits,
		})
	}

	// abs will take the absolute value of this Float. A copy is returned without adjusting this object.
	abs() {
		return new Float({
			number: Math.abs(this.number),
			significantDigits: this.significantDigits,
			power: this.power,
		})
	}

	// add will add a number to this number. It does not adjust this object but returns a copy. Normally it uses the rules of significant digits when adding, so 16 + 2.8 will be displayed as 19 (two significant digits). If keepDecimals is set to true (default false) then these will be kept and 16 + 2.8 will be 18.8 (three significant digits).
	add(x, keepDecimals = false) {
		// Check the input.
		if (x.constructor !== this.constructor) // If constructors don't match, try to extract something anyway.
			x = new this.constructor(x)

		// Find the lowest number of decimals. (So if we add 0.15 to 0.026 then the decimals are 2 and 3 and the lowest is 2.)
		const minDecimals = (keepDecimals ? Math.max : Math.min)(this.decimals, x.decimals)

		// Use the lowest number of decimals to set the number of significant digits.
		const number = this.number + x.number
		const significantDigits = number === 0 ?
			minDecimals + 1 :
			Math.max(Math.floor(Math.log10(Math.abs(number))) + minDecimals + 1, 1)

		// Set up the result.
		return new Float({
			number,
			power: this.power === x.power ? this.power : undefined,
			significantDigits,
		})
	}

	// subtract will subtract a number, just like add adds it.
	subtract(x, keepDecimals) {
		// Check the input.
		if (x.constructor !== this.constructor) // If constructors don't match, try to extract something anyway.
			x = new this.constructor(x)

		// Add the negative number.
		return this.add(x.applyMinus(), keepDecimals)
	}

	// invert will turn this number into 1/number. It returns a copy without adjusting this object.
	invert() {
		if (this.number === 0)
			throw new Error(`Invalid invert call: cannot invert zero. Dividing by zero not allowed.`)
		return new Float({
			number: 1 / this.number,
			significantDigits: this.significantDigits,
		})
	}

	// multiply multiplies this number by another number. It does not adjust this object but returns a copy. If keepDigits is set to true, the rules of significant digits are not followed, but instead more significant digits may be added.
	multiply(x, keepDigits = false) {
		// Check the input.
		if (x.constructor !== this.constructor) // If constructors don't match, try to extract something anyway.
			x = new this.constructor(x)

		// Process the result.
		return new Float({
			number: this.number * x.number,
			significantDigits: (keepDigits ? Math.max : Math.min)(this.significantDigits, x.significantDigits),
			// Do not specify a power: it is not valid anymore after multiplication.
		})
	}

	// divide will divide this number by the given number, just like multiply multiplies.
	divide(x, keepDigits) {
		// Check the input.
		if (x.constructor !== this.constructor) // If constructors don't match, try to extract something anyway.
			x = new this.constructor(x)

		// Multiply by the inverted number.
		return this.multiply(x.invert(), keepDigits)
	}

	// toPower will take this number to the given power. So "2,0 * 10^2" to the power 3 will be "8,0 * 10^6".
	toPower(power) {
		// Process input.
		if (power.constructor === this.constructor)
			power = power.number
		power = ensureNumber(power)

		// Check boundary cases.
		if (this.number < 0 && !isInt(power))
			throw new Error(`Invalid toPower call: cannot take a fractional power of a negative number. That is, "(${this.number}) ^ (${power})" cannot be calculated.`)
		if (power === 0) {
			return new Float({
				number: 1,
				significantDigits: Infinity,
			})
		}

		// Calculate power.
		if (power < 0)
			return this.invert().toPower(-power)
		return new Float({
			number: Math.pow(this.number, power),
			significantDigits: this.significantDigits,
		})
	}

	// roundToPrecision will take a number that may have digits behind the scenes (like { number: 3.14159, significantDigits: 2 }) and round it to the precision, removing hidden digits. So the result will have { number: 3.1, significantDigits: 2 }. It does not adjust this object but returns a copy.
	roundToPrecision() {
		return new Float({
			number: (this.significantDigits === Infinity ? this.number : roundToDigits(this.number, this.significantDigits)),
			significantDigits: this.significantDigits,
			power: this.power,
		})
	}
}
module.exports.Float = Float

Float.defaultComparison = {
	absoluteMargin: 'auto',
	relativeMargin: 0.000001,
	accuracyFactor: 1,
	significantDigitMargin: Infinity,
	checkPower: false,
}
