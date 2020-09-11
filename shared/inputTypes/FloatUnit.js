// The FloatUnit class represents a combination of a floating point number and a unit. An example is "9.81 m / s^2". It can be given a string, or an object of the form { float: ..., unit: ... } where the dots are valid float and unit representations.

const { isObject, processOptions, filterProperties } = require('../util/objects')
const { Float, floatFormat, getRandomFloat, getRandomExponentialFloat, FOtoIO: floatFOtoIO, IOtoFO: floatIOtoFO, getEmpty: getEmptyFloat, isEmpty: isFloatEmpty } = require('./Float')
const { Unit, equalityTypeToSimplifyOptions, FOtoIO: unitFOtoIO, IOtoFO: unitIOtoFO, getEmpty: getEmptyUnit, isEmpty: isUnitEmpty } = require('./Unit')

// const inputFormat = new RegExp(`^(?<float>${floatFormat})(?<unit>.*)$`) // Firefox doesn't support named capture groups.
const inputFormat = new RegExp(`^(${floatFormat})(.*)$`)

class FloatUnit {
	// The constructor must either get an object { float: ..., unit: ... } or a string which can be split up into a float and a unit.

	constructor(input = {}) {
		// If we have a type FloatUnit, just copy it.
		if (isObject(input) && input.constructor === FloatUnit)
			return this.become(input)

		// If we have a string, split it up into an object first.
		if (typeof input === 'string')
			input = splitString(input)

		// Include default values.
		input = processOptions(input, { float: {}, unit: {} })

		// Save the input.
		this._float = new Float(input.float)
		this._unit = new Unit(input.unit)
	}

	get float() {
		return this._float
	}

	get unit() {
		return this._unit
	}

	// string returns a string representation of this number with unit.
	get str() {
		return this.toString()
	}

	// toString returns a string representation of the number with unit.
	toString() {
		const float = this._float.str
		const unit = this._unit.str
		return float + (float.length > 0 && unit.length > 0 ? ' ' : '') + unit
	}

	get tex() {
		return this._float.tex + '\\ ' + this._unit.tex
	}

	// SO returns a storage representation of this object that can be interpreted again.
	get SO() {
		return {
			float: this.float.SO,
			unit: this.unit.SO,
		}
	}

	// clone provides a clone of this object.
	clone() {
		return new this.constructor(this.SO)
	}

	// become turns this object into a clone of the given object.
	become(param) {
		if (!isObject(param) || param.constructor !== FloatUnit)
			throw new Error(`Invalid input: a FloatUnit element cannot become the given object. This object has type "${typeof param}".`)
		this._float = param.float.clone()
		this._unit = param.unit.clone()
		return this
	}

	// isValid returns whether we have a valid unit (true or false). So whether all unit elements in this unit are valid unit elements: whether they have been recognized. (The Float is always valid.)
	isValid() {
		return this._unit.isValid()
	}

	// makeExact sets the number of significant digits to Infinity, indicating we know this number with full precision. It returns itself to allow for chaining.
	makeExact() {
		this._float.makeExact()
		return this
	}

	// simplify simplifies the unit of this FloatUnit. It adjusts the Float accordingly: for example, when going from km to m the float is multiplied by 1000. Options are the same as the options for simplifying units. (See the Unit simplify function.)
	simplify(options = {}) {
		// Obtain an adjustment object and use it to adjust the float.
		const adjustment = this._unit.simplifyWithData(options)
		if (adjustment.difference !== 0)
			this._float.add({ number: adjustment.difference })
		if (adjustment.factor !== 1)
			this._float.multiply({ number: adjustment.factor })
		if (adjustment.power !== 0)
			this._float.multiply({ number: Math.pow(10, adjustment.power) }).simplify()
		return this
	}

	// equals compares two FloatUnits. It only returns true or false.
	equals(x, options = {}) {
		return this.checkEquality(x, options).result
	}

	/* checkEquality compares two FloatUnit objects. Options include:
	 * - absoluteMargin: same as with Float.
	 * - relativeMargin: same as with Float.
	 * - significantDigitMargin: same as with Float.
	 * - unitCheck: same as the Unit type parameter.
	 * Note that the following options are not supported.
	 * - checkPower (from Float): this is not possible anymore, since simplifying the unit will adjust the power of the unit. This will be the default "false".
	 * - checkSize (from Unit): this will be set to false, because we are checking the size of the number instead.
	 * 
	 * The result is an object containing information. It contains the information from the Float checkEquality but also has:
	 * - result (true or false): the final verdict on equality.
	 * - numberOK (true or false): is the number OK? This is a joint check of magnitude, significant digits (if specified) and power (if specified).
	 * - unitOK (true or false): is the unit OK?
	 */
	checkEquality(x, options = {}) {
		// If constructors don't match, no comparison is possible.
		if (this.constructor !== x.constructor)
			throw new Error(`Invalid comparison: cannot compare a number of type "${this.constructor.name || 'unknown'}" with a number of type "${x.constructor.name || 'unknown'}".`)

		// Fill out any missing options with defaults.
		options = processOptions(options, FloatUnit.defaultEqualityOptions)

		// Make clones to avoid editing the original objects.
		const a = this.clone()
		const b = x.clone()

		// Ensure validity of both FloatUnits and deal with it if they are not valid.
		const floatEqualityOptions = filterProperties(options, Object.keys(Float.defaultEqualityOptions))
		const handleInvalidResult = (unitOK) => {
			const floatComparison = a.float.checkEquality(b.float, floatEqualityOptions)
			const numberOK = floatComparison.result
			return {
				...floatComparison,
				result: unitOK && numberOK,
				unitOK,
				numberOK,
			}
		}
		if (!a.isValid()) {
			if (b.isValid())
				return handleInvalidResult(false) // One is valid, the other is not.
			return handleInvalidResult(deepEquals(a.SO, b.SO)) // We have invalid units: just do a deepEquals.
		}
		if (!b.isValid())
			return handleInvalidResult(false)

		// Simplify the units based on the given options. This will adjust the floats accordingly.
		const simplifyOptions = equalityTypeToSimplifyOptions(options.unitCheck)
		a.simplify(simplifyOptions)
		b.simplify(simplifyOptions)

		// Compare the floats and the units.
		const floatComparison = a.float.checkEquality(b.float, floatEqualityOptions) // This is an object.
		const unitComparison = a.unit.str === b.unit.str // This is just a boolean. Note that the units have already been simplified, so a direct string comparison is possible.

		// Assemble the result.
		return {
			...floatComparison,
			result: floatComparison.result && unitComparison,
			numberOK: floatComparison.result,
			unitOK: unitComparison
		}
	}

	// add will add two FloatUnits together. They must have the same unit (when simplified) or an error is thrown. If the unit of the added quantity is merely written differently (for example N*m instead of J) then this is ignored: the unit of this object stays the same. This object is adjusted and returned for chaining.
	add(x) {
		// Check input.
		if (x.constructor !== this.constructor) // If constructors don't match, try to extract something anyway.
			x = new this.constructor(x)
		if (!this.unit.equals(x.unit)) // If units don't match, throw an error.
			throw new Error(`Invalid addition: cannot add two quantities with different units. Tried to add "${this.str}" to "${x.str}".`)

		// Add the quantities within the float and we're done.
		this.float.add(x.float)
		return this
	}

	// multiply will multiply two FloatUnits. This object is adjusted and returned.
	multiply(x) {
		// Check input.
		if (x.constructor !== this.constructor) // If constructors don't match, try to extract something anyway.
			x = new this.constructor(x)

		// Perform the multiplication.
		this._float.multiply(x.float)
		this._unit.multiply(x.unit)
		return this
	}
}
module.exports.FloatUnit = FloatUnit

// Define equality check types.
FloatUnit.equalityTypes = {
	exact: 0,
	sameUnitsAndPrefixes: 1,
	sameUnits: 2,
	free: 3,
}
FloatUnit.defaultEqualityOptions = {
	absoluteMargin: Float.defaultEqualityOptions.absoluteMargin,
	relativeMargin: Float.defaultEqualityOptions.relativeMargin,
	significantDigitMargin: Float.defaultEqualityOptions.significantDigitMargin,
	unitCheck: Unit.defaultEqualityOptions.type,
}

// splitString turns a string representation of (hopefully) a FloatUnit into two strings, returning them as an object { float: "...", unit: "..." }.
function splitString(str) {
	// Check boundary cases.
	str = str.trim()
	if (str === '')
		return {}

	// Check if the string has the required format.
	let match = inputFormat.exec(str)
	if (!match)
		throw new Error(`Invalid FloatUnit number given: could not parse "${str}". It did not have the required format of "xxx.xxxx * 10^(yy) [units]".`)

	// Further process and save the results.
	return {
		float: match[1],
		unit: match[10],
	}
}

// getRandomFloatUnit gives a random Float with given Unit.
function getRandomFloatUnit(options) {
	return new FloatUnit({
		float: getRandomFloat(options),
		unit: options.unit,
	})
}
module.exports.getRandomFloatUnit = getRandomFloatUnit

// getRandomExponentialFloatUnit gives a random Float according to an exponential distribution with given Unit.
function getRandomExponentialFloatUnit(options) {
	return new FloatUnit({
		float: getRandomExponentialFloat(options),
		unit: options.unit,
	})
}
module.exports.getRandomExponentialFloatUnit = getRandomExponentialFloatUnit

// The following functions are obligatory functions.
function isFOofType(floatUnit) {
	return isObject(floatUnit) && floatUnit.constructor === FloatUnit
}
module.exports.isFOofType = isFOofType

function FOtoIO(floatUnit) {
	// Check if we have a FloatUnit object already. If not, turn it into one. (Or die trying.)
	if (floatUnit.constructor !== FloatUnit)
		floatUnit = new FloatUnit(floatUnit)

	// Find a way to display the FloatUnit.
	return {
		float: floatFOtoIO(floatUnit.float),
		unit: unitFOtoIO(floatUnit.unit),
	}
}
module.exports.FOtoIO = FOtoIO

function IOtoFO(value) {
	return new FloatUnit({
		float: floatIOtoFO(value.float),
		unit: unitIOtoFO(value.unit),
	})
}
module.exports.IOtoFO = IOtoFO

function getEmpty() {
	return { float: getEmptyFloat(), unit: getEmptyUnit() }
}
module.exports.getEmpty = getEmpty

function isEmpty(value) {
	return isFloatEmpty(value.float) && isUnitEmpty(value.unit)
}
module.exports.isEmpty = isEmpty

function equals(a, b) {
	return IOtoFO(a).equals(IOtoFO(b))
}
module.exports.equals = equals