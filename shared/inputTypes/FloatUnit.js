// The FloatUnit class represents a combination of a floating point number and a unit. An example is "9.81 m / s^2". It can be given a string, or an object of the form { float: ..., unit: ... } where the dots are valid float and unit representations.

const { isObject, processOptions } = require('../util/objects')
const { Float, floatFormat, defaultEqualityOptions: defaultFloatEqualityOptions, FOtoIO: floatFOtoIO, IOtoFO: floatIOtoFO, getEmpty: getEmptyFloat, isEmpty: isFloatEmpty } = require('./Float')
const { Unit, defaultEqualityOptions: defaultUnitEqualityOptions, FOtoIO: unitFOtoIO, IOtoFO: unitIOtoFO, getEmpty: getEmptyUnit, isEmpty: isUnitEmpty } = require('./Unit')

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

	// simplify simplifies this float with unit. It simplifies the unit given the options (see the Unit class for which options they are) and adjusts the number accordingly.
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

	/* checkEquality compares two FloatUnit objects. Options can include any of the options of the Float and Unit equality functions. There is limited interaction between these options:
	 * - When the simplification of the unit results in an adjustment of the power of the Float, then the Float will be simplified and the power hence cannot be compared anymore.
	 * The result is an object containing information. It contains the information from the Float checkEquality but also has:
	 * - result (true or false): the final verdict on equality.
	 * - numberOK (true or false): is the number OK? This is a joint check of magnitude, significant digits (if specified) and power (if specified).
	 * - unitOK (true or false): is the unit OK?
	 */
	checkEquality(x, options = {}) {
		// If constructors don't match, no comparison is possible.
		if (this.constructor !== x.constructor)
			throw new Error(`Invalid comparison: cannot compare a number of type "${this.constructor.name || 'unknown'}" with a number of type "${x.constructor.name || 'unknown'}".`)

		// Make to avoid editing the original objects.
		let result = { result: true } // Assume equality.
		const a = this.clone()
		const b = x.clone()

		// Ensure validity of both FloatUnits.
		if (!a.isValid()) {
			if (b.isValid())
				return false // One is valid, the other is not.
			return deepEquals(a, b) // We have invalid units: just do a deepEquals.
		}
		if (!b.isValid())
			return false

		// Simplify the objects based on the given options. This will adjust the float accordingly.
		const simplifyOptions = {
			removePrefixes: !options.comparePrefixes,
			sortUnits: !options.compareOrder,
			toStandardUnits: (!options.comparePrefixes && !options.compareOrder && options.simplifyUnit),
			toBaseUnits: (!options.comparePrefixes && !options.compareOrder && options.simplifyUnit),
		}
		a.simplify(simplifyOptions)
		b.simplify(simplifyOptions)

		// Next, compare the floats.
		const floatEqualityOptions = {}
		Object.keys(defaultFloatEqualityOptions).forEach(option => (options[option] !== undefined ? floatEqualityOptions[option] = options[option] : 0))
		const floatComparison = a.float.checkEquality(b.float, floatEqualityOptions)
		result = {
			...floatComparison,
			...result,
			result: result.result && floatComparison.result,
			numberOK: floatComparison.result,
		}

		// Afterwards, compare the units.
		const unitEqualityOptions = {}
		Object.keys(defaultUnitEqualityOptions).forEach(option => (options[option] !== undefined ? unitEqualityOptions[option] = options[option] : 0))
		result.unitOK = a.unit.equals(b.unit, unitEqualityOptions)
		result.result = result.result && result.unitOK

		// We're done!
		return result
	}

	// equals compares two FloatUnits. It only returns true or false.
	equals(x, options = {}) {
		return this.checkEquality(x, options).result
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