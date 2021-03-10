const { isInt, ensureInt, isNumber } = require('../util/numbers')
const { isObject, processOptions } = require('../util/objects')
const { getRandomInteger: getRandomIntegerNumber } = require('../util/random')

class Integer {
	/* The constructor input can be a number (-123) or a string ("-123"). */
	constructor(input = 0) {
		// If we have a type Integer, just copy it.
		if (isObject(input) && input.constructor === Integer)
			return this.become(input)
		
		// Otherwise check the input.
		if (!isInt(input))
			throw new Error(`Invalid input: an Integer object should receive an integer (albeit as a string) as input. Instead, it received "${input}".`)
		
		// Store the input.
		this._number = parseInt(input)
	}

	// become turns this object into a clone of the given object.
	become(param) {
		if (!isObject(param) || param.constructor !== Integer)
			throw new Error(`Invalid input: an Integer element cannot become the given object. This object has type "${typeof param}".`)
		this._number = param.number
		return this
	}

	// number returns the number itself. So it could give -123.
	get number() {
		return this._number
	}

	// str returns a string representation of this number.
	get str() {
		return this.toString()
	}

	// toString returns a string representation of this number.
	toString() {
		return this.number.toString()
	}

	get tex() {
		return this.toString()
	}

	// texWithPM will return latex code but then with a plus or minus prior to the number, so it can be used as a term in an equation. For "5" it will return "+5", for "-5" it will return "-5" and for "0" it returns "+0".
	get texWithPM() {
		return (this.number < 0 ? '' : '+') + this.tex
	}

	// texWithBrackets will return latex code, but then with brackets if this is a negative number.
	get texWithBrackets() {
		return (this.number < 0 ? `\\left(${this.tex}\\right)` : this.tex)
	}

	// SO returns a storage object representation of this float number that can be interpreted again.
	get SO() {
		return this.number
	}

	// clone provides a clone of this object.
	clone() {
		return new this.constructor(this.SO)
	}

	// simplify doesn't do anything for Integer objects. It just returns a clone.
	simplify() {
		return this.clone()
	}

	// compare receives an Integer object and checks which one is bigger. If this object is bigger, then 1 is returned. If the other one is bigger, -1 is returned. If the size is equal, 0 is given.
	compare(x) {
		// If constructors don't match, no comparison is possible.
		if (this.constructor !== x.constructor)
			throw new Error(`Invalid comparison: cannot compare a number of type "${this.constructor.name || 'unknown'}" with a number of type "${x.constructor.name || 'unknown'}".`)

		// Compare the numbers.
		const a = this.number
		const b = x.number
		return (a > b ? 1 : (a < b ? -1 : 0))
	}

	// equals compares two Integers. It only returns true or false.
	equals(x, options = {}) {
		return this.checkEquality(x, options).result
	}

	//TODO
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
		if (isInt(x))
			x = new Integer(x)
		if (this.constructor !== x.constructor)
			throw new Error(`Invalid comparison: cannot compare a number of type "${this.constructor.name || 'unknown'}" with a number of type "${x.constructor.name || 'unknown'}".`)
		
		// Check the options.
		options = processOptions(options, Integer.defaultEqualityOptions)
		if (!isNumber(options.absoluteMargin) || options.absoluteMargin < 0)
			throw new Error(`Invalid options: the parameter absoluteMargin must be a non-negative number but "${options.absoluteMargin}" was given.`)
		if (!isNumber(options.relativeMargin) || options.relativeMargin < 0)
			throw new Error(`Invalid options: the parameter relativeMargin must be a non-negative number, but "${options.relativeMargin}" was given.`)
		if (!isNumber(options.accuracyFactor) || options.accuracyFactor < 0)
			throw new Error(`Invalid options: the parameter accuracyFactor must be a non-negative number, but "${options.accuracyFactor}" was given.`)

		// Check the values, by seeing if one of the given margins matches out.
		const result = { result: true } // Assume equality.
		const n1 = this.number
		const n2 = x.number
		const absoluteMargin = options.absoluteMargin * options.accuracyFactor
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

		return result
	}

	get sign() {
		return Math.sign(this.number)
	}

	// applyMinus will return minus this number. It does not adjust this object but returns a copy.
	applyMinus() {
		return new Integer(-this.number)
	}

	// abs will take the absolute value of this Float. A copy is returned without adjusting this object.
	abs() {
		return new Integer(Math.abs(this.number))
	}

	// add will add a number to this number. It does not adjust this object but returns a copy.
	add(x) {
		// Check the input.
		if (x.constructor !== this.constructor) // If constructors don't match, try to extract something anyway.
			x = new this.constructor(x)
		
		// Perform the addition.
		return new Integer(this.number + x.number)
	}

	// subtract will subtract a number, just like add adds it.
	subtract(x) {
		// Check the input.
		if (x.constructor !== this.constructor) // If constructors don't match, try to extract something anyway.
			x = new this.constructor(x)

		// Add the negative number.
		return this.add(x.applyMinus())
	}

	// multiply multiplies this number by another number. It does not adjust this object but returns a copy.
	multiply(x) {
		// Check the input.
		if (x.constructor !== this.constructor) // If constructors don't match, try to extract something anyway.
			x = new this.constructor(x)

		// Process the result.
		return new Integer(this.number * x.number)
	}

	// divide will divide this number by the given number, just like multiply multiplies. It rounds the outcome to ensure an integer. If this is not desired, transform the dividing object into a Float first.
	divide(x) {
		// Check the input.
		if (x.constructor !== this.constructor) // If constructors don't match, try to extract something anyway.
			x = new this.constructor(x)

		// Process the result.
		return new Integer(Math.round(this.number / x.number))
	}

	// toPower will take this number to the given power. It supports only non-negative integer powers.
	toPower(power) {
		// Process input.
		if (power.constructor === this.constructor)
			power = power.number
		power = ensureInt(power, true)

		// Check boundary cases.
		if (power === 0)
			return new Integer(1)

		// Calculate power.
		return new Integer(Math.pow(this.number, power))
	}
}
module.exports.Integer = Integer

Integer.defaultEqualityOptions = {
	absoluteMargin: 0,
	relativeMargin: 0,
	accuracyFactor: 1,
}

/* getRandomInteger returns a random integer object between the given min and max, according to a uniform distribution. It must receive an options object which can include:
 * - min (obligatory): the minimum value (inclusive).
 * - max (obligatory): the maximum value (inclusive).
 * - prevent: an integer or array of integers to exclude. For instance, using { min: -3, max: 3, prevent: [-1, 0, 1] } will give either -3, -2, 2 or 3.
 */
function getRandomInteger(options) {
	// Check input: must be numbers.
	let { min, max, prevent } = options
	min = ensureInt(min)
	max = ensureInt(max)
	prevent = prevent === undefined ? [] : (Array.isArray(prevent) ? prevent : [prevent])

	// Check the number of options.
	if (max - min + 1 <= prevent.length)
		throw new Error(`Invalid getRandomInteger options: we tried to generate a random number between ${max} and ${min}, but (after taking into account a prevent-array) there were no options left.`)

	// Set up a random integer number.
	const number = getRandomIntegerNumber(min, max)

	// Check if it's in the prevent list.
	if (prevent.includes(number))
		return getRandomInteger(options)

	// All good!
	return new Integer(number)
}
module.exports.getRandomInteger = getRandomInteger

function isFOofType(int) {
	return isObject(int) && int.constructor === Integer
}
module.exports.isFOofType = isFOofType

function FOtoIO(int) {
	// Check if we have an Integer object already. If not, turn it into one. (Or die trying.)
	if (int.constructor !== Integer)
		int = new Float(Integer)

	// The input object is just a string.
	return int.toString()
}
module.exports.FOtoIO = FOtoIO

function IOtoFO(value) {
	if (value === '' || value === '-')
		return new Integer(0)
	return new Integer(parseInt(value))
}
module.exports.IOtoFO = IOtoFO

function getEmpty() {
	return ''
}
module.exports.getEmpty = getEmpty

function isEmpty(value) {
	if (typeof value !== 'string')
		throw new Error(`Invalid type: expected a string but received "${JSON.stringify(value)}".`)
	return value === ''
}
module.exports.isEmpty = isEmpty

function equals(a, b) {
	return IOtoFO(a).equals(IOtoFO(b))
}
module.exports.equals = equals