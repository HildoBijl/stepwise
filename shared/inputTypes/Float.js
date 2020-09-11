// The Float class represents floating point numbers with a certain number of significant digits. By default it is an empty string with zero significant digits.

const { isInt, ensureInt, isNumber, ensureNumber, roundTo } = require('../util/numbers')
const { isObject, processOptions } = require('../util/objects')
const { getRandom } = require('../util/random')

const numberFormat = '-?(\\d+[.,]?\\d*)|(\\d*[.,]?\\d+)'
const regNumberFormat = new RegExp(`^${numberFormat}$`)
// const floatFormat = `(?<number>${numberFormat})(?:\\s*\\*\\s*10\\^(?:(?:\\((?<powerWithBrackets>-?\\d+)\\))|(?<powerWithoutBrackets>-?\\d+)))?` // Firefox doesn't support named capture groups.
const floatFormat = `(${numberFormat})(\\s*\\*\\s*10\\^((\\((-?\\d+)\\))|(-?\\d+)))?`
const regFloatFormat = new RegExp(`^${floatFormat}$`)
module.exports.floatFormat = floatFormat
module.exports.numberFormat = numberFormat

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
		// If we have a type Float, just copy it.
		if (isObject(input) && input.constructor === Float)
			return this.become(input)

		// If we have a string or number, split it up into an object first.
		if (typeof input === 'string')
			input = stringToSO(input)
		else if (typeof input === 'number')
			input = numberToSO(input)

		// Include default values.
		input = processOptions(input, defaultParameters)

		// Process the number.
		if (!isNumber(input.number))
			throw new Error(`Invalid input: a Float number should as parameter receive an object with a numeric number parameter. Instead it received "${JSON.stringify(input)}".`)
		this._number = parseFloat(input.number)

		// Process the significant digits.
		if (!isInt(input.significantDigits) || input.significantDigits < 0)
			throw new Error(`Invalid input: a Float number should as parameter receive an object with a non-negative integer as significantDigits parameter. Instead it received "${JSON.stringify(input)}".`)
		this._significantDigits = input.significantDigits

		// Process the power.
		if (input.power !== undefined && !isInt(input.power))
			throw new Error(`Invalid input: a Float number should as parameter receive an object with an integer as power parameter. Instead it received "${JSON.stringify(input)}".`)
		this._power = typeof input.power === 'string' ? parseInt(input.power) : input.power
	}

	// become turns this object into a clone of the given object.
	become(param) {
		if (!isObject(param) || param.constructor !== Float)
			throw new Error(`Invalid input: a Float element cannot become the given object. This object has type "${typeof param}".`)
		this._number = param.number
		this._significantDigits = param.significantDigits
		this._power = param.power
		return this
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

	// string returns a string representation of this number.
	get str() {
		return this.toString()
	}

	// toString returns a string representation of this number.
	toString() {
		// Check boundary cases.
		if (this._significantDigits === 0)
			return ''

		// Determine the power that's used for string display and use it to determine the corresponding string.
		const power = this.getDisplayPower()
		let str = this.getDisplayNumber(power)

		// Add a power display.
		if (power !== 0) {
			if (power > 0) {
				str += ` * 10^${power} `
			} else {
				str += ` * 10^(${power})`
			}
		}
		return str
	}

	get tex() {
		// Check boundary cases.
		if (this._significantDigits === 0)
			return ''

		// Determine the power that's used for string display and use it to determine the corresponding string.
		const power = this.getDisplayPower()
		let str = this.getDisplayNumber(power)

		// Add a power display.
		if (power !== 0) {
			str += ` \\cdot 10^{${power}}`
		}
		return str
	}

	// getDisplayPower returns the power with which we want to display the number. If the power is known, it is returned. Otherwise we intelligently determine one.
	getDisplayPower() {
		// If the power is set, just return that.
		if (this._power !== undefined)
			return this._power

		// Check boundary case.
		if (this._number === 0)
			return 0

		// No power is set. Let's intelligently determine one.
		const power = Math.floor(Math.log10(Math.abs(this._number))) // This is the one we need to get a number of the form "x.xxx" (with one decimal before the point).
		if (power === -1)
			return 0 // Display a number like 3 * 10^(-1) as 0.3.
		if (power === 1 && this._significantDigits > 1)
			return 0 // Display a number like 1.2 * 10^1 as 12.
		if (power === 2 && this._significantDigits > 2)
			return 0 // Display a number like 2.7315 * 10^2 as 273.15.
		return power
	}

	// getDisplayNumber returns a string representation for the number as it is displayed. This is done for the given power.
	getDisplayNumber(power) {
		// Round the number to the right number of significant digits, taking into account the power that will later be added.
		let number = this._number / Math.pow(10, power || 0)
		if (this._significantDigits < Infinity) {
			const powerForRounding = this._significantDigits - Math.floor(Math.log10(Math.abs(number))) - 1
			number = Math.round(number * Math.pow(10, powerForRounding)) / Math.pow(10, powerForRounding)
		}

		// Add zeros to the end if needed to match the significant digits.
		let str = number.toString()
		const digitsToAdd = this._significantDigits - getSignificantDigits(str)
		if (digitsToAdd > 0 && digitsToAdd < Infinity) // If needed, add zeros to build up to the right amount of digits. Add a period too if there is none yet.
			str += (str.indexOf('.') === -1 ? '.' : '') + '0'.repeat(digitsToAdd)

		// All done!
		return str
	}

	// SO returns a storage object representation of this float number that can be interpreted again.
	get SO() {
		return {
			number: this.number,
			significantDigits: this.significantDigits,
			power: this.power,
		}
	}

	// clone provides a clone of this object.
	clone() {
		return new this.constructor(this.SO)
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

	// simplify sets the format of this number to the default format: x.xxxx * 10^yy. So there's only one non-zero digit prior to the comma. The number of significant digits is kept the same. It does not adjust this object but returns a copy.
	simplify() {
		return new Float({
			number: this.number,
			significantDigits: this.significantDigits,
			// Leave power undefined.
		})
	}

	// equals compares two Floats. It only returns true or false.
	equals(x, options = {}) {
		return this.checkEquality(x, options).result
	}

	/* checkEquality compares the given float with the this-float. Options include:
	 * - absoluteMargin (default 0): the absolute margin that is allowed. If 0.05 is given, then 5.00 will be equal to numbers betwee 4.95 and 5.05 (inclusive).
	 * - relativeMargin (default 0.000001 to prevent numerical issues): the relative margin between the numbers. If 0.01 is given, a 1% margin is used. So then the number 5.00 is considered equal to numbers between 4.95 and 5.0505... (Always the largest number is used to determine margins.) If both a relative and an absolute margin are given, then the numbers are considered equal when one of the margins match. (That is: in doubtful situations, equality is usually set to true.)
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

		// Check the option input.
		options = processOptions(options, Float.defaultEqualityOptions)
		if (!isNumber(options.absoluteMargin) || options.absoluteMargin < 0)
			throw new Error(`Invalid options: the parameter absoluteMargin must be a non-negative number, but "${options.absoluteMargin}" was given.`)
		if (!isNumber(options.relativeMargin) || options.relativeMargin < 0)
			throw new Error(`Invalid options: the parameter relativeMargin must be a non-negative number, but "${options.relativeMargin}" was given.`)
		if (options.significantDigitMargin !== Infinity && (!isInt(options.significantDigitMargin) || options.significantDigitMargin < 0))
			throw new Error(`Invalid options: the parameter significantDigitMargin must be a non-negative integer, but "${options.significantDigitMargin}" was given.`)

		// Check the values, by seeing if one of the given margins matches out.
		const result = { result: true } // Assume equality.
		const n1 = this.number
		const n2 = x.number
		if (n1 >= n2 - options.absoluteMargin && n1 <= n2 + options.absoluteMargin) {
			result.absoluteMarginOK = true
			result.magnitude = 'OK'
		} else if (Math.sign(n1) === Math.sign(n2) && Math.abs(n1) >= Math.abs(n2) * (1 - options.relativeMargin) && Math.abs(n1) <= Math.abs(n2) / (1 - options.relativeMargin)) {
			result.relativeMarginOK = true
			result.magnitude = 'OK'
		} else { // No equality.
			result.result = false
			result.magnitude = (n2 < n1 ? 'TooSmall' : 'TooLarge')
		}

		// Check the number of significant digits.
		if (options.significantDigitMargin !== undefined) {
			result.numSignificantDigits = 'OK'
			if (Math.abs(this.significantDigits - x.significantDigits) > options.significantDigitMargin) {
				result.result = false // No equality.
				result.numSignificantDigits = (x.significantDigits < this.significantDigits ? 'TooSmall' : 'TooLarge')
			}
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

	// applyMinus will return minus this number. It does not adjust this object but returns a copy.
	applyMinus() {
		return new Float({
			number: -this.number,
			power: this.power,
			significantDigits: this.significantDigits,
		})
	}

	// add will add a number to this number. It does not adjust this object but returns a copy.
	add(x) {
		// Check the input.
		if (x.constructor !== this.constructor) // If constructors don't match, try to extract something anyway.
			x = new this.constructor(x)

		// Find the lowest-digit-power for each number and take the highest. (The lowest-digit-power of 0.19 is -2, for 0.199 this is -3, and so forth.)
		const digitPower = Math.max(
			Math.floor(Math.log10(Math.abs(this.number))) - this._significantDigits + 1,
			Math.floor(Math.log10(Math.abs(x.number))) - x.significantDigits + 1,
		)

		// Use the lowest-digit-power to set the number of significant digits.
		const number = this.number + x.number
		return new Float({
			number,
			power: this.power === x.power ? this.power : undefined,
			significantDigits: Math.floor(Math.log10(Math.abs(number))) - digitPower + 1,
		})
	}

	// subtract will subtract a number, just like add adds it.
	subtract(x) {
		// Check the input.
		if (x.constructor !== this.constructor) // If constructors don't match, try to extract something anyway.
			x = new this.constructor(x)

		// Add the negative number.
		return this.add(x.applyMinus())
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

	// multiply multiplies this number by another number. It does not adjust this object but returns a copy.
	multiply(x) {
		// Check the input.
		if (x.constructor !== this.constructor) // If constructors don't match, try to extract something anyway.
			x = new this.constructor(x)

		// Process the result.
		return new Float({
			number: this.number * x.number,
			significantDigits: Math.min(this.significantDigits, x.significantDigits),
			// Do not specify a power: it is not valid anymore after multiplication.
		})
	}

	// divide will divide this number by the given number, just like multiply multiplies.
	divide(x) {
		// Check the input.
		if (x.constructor !== this.constructor) // If constructors don't match, try to extract something anyway.
			x = new this.constructor(x)

		// Multiply by the inverted number.
		return this.multiply(x.invert())
	}

	// toPower will take this number to the given power. So "2,0 * 10^2" to the power 3 will be "8,0 * 10^6".
	toPower(power) {
		power = ensureInt(power)
		if (power === 0) {
			return new Float({
				number: 1,
				significantDigits: Infinite,
			})
		}

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
			number: (this.significantDigits === Infinity ? this.number : roundTo(this.number, this.significantDigits)),
			significantDigits: this.significantDigits,
			power: this.power,
		})
	}
}
module.exports.Float = Float

Float.defaultEqualityOptions = {
	absoluteMargin: 0,
	relativeMargin: 0.000001,
	significantDigitMargin: Infinity,
	checkPower: false,
}

/* getRandomFloat returns a random float between the given min and max, according to a uniform distribution. You can either set:
 * - the number of decimals. Use "1" for "23.4" and "-1" for "2.34 * 10^3".
 * - the number of significant digits. Use "3" for "23.4" and "2.34 * 10^3".
 * If none is given then infinite precision will be assumed.
 * If round is true (default true) the number will be rounded to be precisely "23.4" and not be "23.4321" or so behind the scenes.
 */
function getRandomFloat(options) {
	// Check input: must be numbers.
	let { min, max } = options
	min = ensureNumber(min)
	max = ensureNumber(max)

	// Set up a random float.
	const number = getRandom(min, max)
	return processFloat(number, options)
}
module.exports.getRandomFloat = getRandomFloat

// getRandomExponentialFloat returns a random float between the given min and max. It does this according to an exponential distribution to satisfy Benford's law. Optionally, "negative" can be set to true to force a negative sign, or otherwise "randomSign" can be set to true to also get negative numbers.
function getRandomExponentialFloat(options) {
	// Check input: must be nonzero positive numbers.
	let { min, max, negative, randomSign } = options
	min = ensureNumber(min, true, true)
	max = ensureNumber(max, true, true)

	// Set up a random float.
	const randomExp = getRandom(Math.log10(min), Math.log10(max))
	const sign = (negative || (randomSign && Math.random()) < 0.5) ? -1 : 1
	const number = sign * Math.pow(10, randomExp)
	return processFloat(number, options)
}
module.exports.getRandomExponentialFloat = getRandomExponentialFloat

// processFloat turns the given number with the corresponding options into a Float object.
function processFloat(number, { decimals, significantDigits, round = true }) {
	// Check input.
	if (decimals !== undefined && significantDigits !== undefined)
		throw new Error(`Invalid input: cannot set both the number of decimals and number of significant digits.`)

	// Determine the number and set its precision accordingly.
	let float
	if (decimals !== undefined) {
		float = new Float({ number, significantDigits: Math.floor(Math.log10(Math.abs(number))) + 1 + decimals })
	} else if (significantDigits !== undefined) {
		float = new Float({ number, significantDigits })
	} else {
		float = new Float({ number, significantDigits: Infinity })
	}
	if (round)
		float.roundToPrecision()
	return float
}

// getSignificantDigits returns the number of significant digits that a number in string format has.
function getSignificantDigits(str) {
	// Check input.
	if (typeof str !== 'string')
		throw new Error(`Invalid input: expected a string but received an input parameter of type "${typeof str}".`)
	if (!regNumberFormat.exec(str))
		throw new Error(`Invalid input: tried to get the number of significant digits from a string, but received a non-numeric string "${str}".`)

	// Check boundary cases.
	const strAsArray = str.replace(/[,.-]+/g, '').split('')
	if (strAsArray.every(x => (x === '0' || x === '.'))) // Only zeros or dots.
		return 0

	// Return the number of digits minus the number of leading zeros.
	return strAsArray.length - strAsArray.findIndex(x => (x !== '0'))
}
module.exports.getSignificantDigits = getSignificantDigits

// stringToSO turns a string into a storage object that can be interpreted.
function stringToSO(str) {
	// Check boundary cases.
	str = str.trim()
	if (str === '')
		return {}

	// Check the format.
	let match = regFloatFormat.exec(str)
	if (!match)
		throw new Error(`Invalid Float number given: could not parse "${str}". It did not have the required format of "xxx.xxxx * 10^(yy)", where the power and brackets are optional.`)

	// Extract number data and return it.
	const numberStr = (match[1] || match[2]).replace(',', '.') // Turn a comma into a period. (Dutch vs US formatting.)
	const power = parseInt(match[7] || match[8] || 0)
	return {
		number: parseFloat(numberStr) * Math.pow(10, power || 0),
		significantDigits: getSignificantDigits(numberStr),
		power,
	}
}
module.exports.stringToSO = stringToSO

// numberToSO turns a number into a storage object that can be interpreted.
function numberToSO(number) {
	return {
		number,
		significantDigits: getSignificantDigits(number.toString()),
	}
}
module.exports.numberToSO = numberToSO

// The following functions are obligatory functions.
function isFOofType(float) {
	return isObject(float) && float.constructor === Float
}
module.exports.isFOofType = isFOofType

function FOtoIO(float) {
	// Check if we have a Float object already. If not, turn it into one. (Or die trying.)
	if (float.constructor !== Float)
		float = new Float(float)

	// Find a way to display the float.
	const power = float.getDisplayPower()
	return {
		number: float.getDisplayNumber(power),
		power: power === 0 ? '' : power.toString(),
	}
}
module.exports.FOtoIO = FOtoIO

function IOtoFO(value) {
	// Grab the number and the power. Take into account a few boundary cases.
	let { number, power } = value
	number = (number === '' || number === '-' || number === '.' || number === '-.' ? '0' : number)
	power = (power === '' || power === '-' ? 0 : parseInt(power))

	// Set up a float with the given properties.
	return new Float({
		number: parseFloat(number) * Math.pow(10, power),
		significantDigits: getSignificantDigits(number),
		power,
	})
}
module.exports.IOtoFO = IOtoFO

function getEmpty() {
	return { number: '', power: '' }
}
module.exports.getEmpty = getEmpty

function isEmpty(value) {
	return value.number === '' && value.power === ''
}
module.exports.isEmpty = isEmpty

function equals(a, b) {
	return IOtoFO(a).equals(IOtoFO(b))
}
module.exports.equals = equals