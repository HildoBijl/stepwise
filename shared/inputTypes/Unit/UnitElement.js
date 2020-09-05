// UnitElement represents a single term in a Unit. Something like km^3, mV^2 or even m°C^2, but not a composed unit like m/s. Only positive powers are allowed, because negative powers are fixed within the Unit class. Zero powers are also not allowed (pointless anyway).

const { isInt } = require('../../util/numbers')
const { isObject, processOptions } = require('../../util/objects')
const { prefixes, findPrefix } = require('./prefixes')
const { specialUnitSymbols, findUnit } = require('./units')

// const inputFormat = RegExp(`^(?<unitText>[a-zA-Z${specialUnitSymbols.join('')}]+)(?:\\^(?<power>\\d+))?$`) // Firefox doesn't support named capture groups.
const inputFormat = RegExp(`^([a-zA-Z${specialUnitSymbols.join('')}]+)(\\^(\\d+))?$`)

class UnitElement {
	// The constructor input can be of the form string or SO. A string is like "km^3" and a Storage Object is of the form { prefix: 'mu', unit: 'm', power: 2 }. All parameters in this form are optional. Defaults are empty string for the prefix and unit and 1 for the power.

	constructor(input = {}) {
		// If we have a string, turn it to an object.
		if (typeof input === 'string')
			input = stringToSO(input)

		// Include default values.
		input = processOptions(input, { prefix: '', unit: '', power: 1, invalid: undefined })

		// Process the prefix.
		if (typeof input.prefix !== 'string')
			throw new Error(`Invalid prefix given: only prefixes of type string are allowed, but the prefix given was of type "${typeof input.prefix}".`)
		if (input.prefix.length > 0) {
			this._prefix = findPrefix(input.prefix)
			if (!this._prefix)
				throw new Error(`Unknown prefix given: did not recognize prefix "${input.prefix}".`)
		}

		// Process the unit.
		if (typeof input.unit !== 'string')
			throw new Error(`Invalid unit given: only units of type string are allowed, but the unit given was of type "${typeof input.unit}".`)
		this._unit = findUnit(input.unit) || input.unit // Try to turn it into a known unit object. If this fails, keep the string.

		// Process the power.
		if (input.power === '')
			this._power = 1
		else if (!isInt(input.power) || input.power <= 0)
			throw new Error(`Invalid power given: no non-positive powers are allowed for units, but received "${input.power}".`)
		else
			this._power = parseInt(input.power)
	}

	get prefix() {
		return this._prefix
	}

	get unit() {
		return this._unit
	}

	get power() {
		return this._power
	}

	// prefixString is the string related to the prefix.
	get prefixString() {
		if (!this.hasPrefix())
			return ''
		return this.prefix.letter
	}

	// unitString is the string related to the unit. So it's not the "meters" object, but the actual text "m".
	get unitString() {
		if (this.isValid())
			return this.unit.str
		return this.unit
	}

	// getStringWithoutPower returns a string representation of just the prefix and the base unit.
	getStringWithoutPower() {
		return this.prefixString + this.unitString
	}

	// string returns a string representation of this number.
	get str() {
		return this.toString()
	}

	// toString returns a string representation of the number.
	toString() {
		let str = this.getStringWithoutPower()
		if (this._power !== 1)
			str += `^${this._power}`
		return str
	}

	get tex() {
		let tex = this.getStringWithoutPower()
		if (this._power !== 1)
			tex += `^{${this._power}}`
		return `{\\rm ${tex}}`
	}

	// SO gives a storage object representation, containing only the relevant data. It has no attached methods, like this class.
	get SO() {
		return {
			prefix: this.prefixString,
			unit: this.unitString,
			power: this.power,
		}
	}

	// clone provides a clone of this unit element.
	clone() {
		return new this.constructor(this.SO)
	}

	// hasPrefix returns true/false: does the UnitElement have a prefix?
	hasPrefix() {
		return !!this._prefix
	}

	// prefixPower gives the power of the prefix of this unit element.
	get prefixPower() {
		return this.hasPrefix() ? this._prefix.power : 0
	}

	// isValid returns true/false: is this UnitElement a valid unit? If we found a unit (like "m") then the unit property will be a unit object. If not, it will just be a string.
	isValid() {
		return typeof this.unit !== 'string'
	}

	// isInStandardUnits return true/false: is this UnitElement a standard unit?
	isInStandardUnits() {
		return this.isValid() && this.unit.standard
	}

	// removePrefix removes the prefix for this unit element. (Unless the unit has a standard prefix, like kg, in which case the prefix is set to that default prefix.) The number returned is the power which is given from the prefixes. For instance, simplifying "km^2" will give a power of 6, since it's 10^6" times larger than the end-result "m^2".
	removePrefix() {
		const power = (this.prefixPower - this.unit.defaultPrefixPower) * this.power
		this._prefix = this.unit.defaultPrefix
		return power
	}

	// toPower takes this unit element to the given power. For instance, if we have 'km^3' and take it to power 4, we will get (km^3)^4 = km^12. This unit element is adjusted and returned.
	toPower(power) {
		if (!isInt(power) || power <= 0)
			throw new Error(`Invalid power given: no non-positive powers are allowed for units.`)
		this._power *= power
		return this
	}
}
module.exports.UnitElement = UnitElement

// stringToSO turns a string representation of a unit element to an object representation. So it turns "km^2" into { prefix: "k", unit: "m", power: 2 }.
function stringToSO(str) {
	// An empty string is allowed. If we have this, just use default properties.
	str = str.trim()
	if (str === '')
		return {}

	// Check if the string has the required format.
	let match = inputFormat.exec(str)
	if (!match)
		throw new Error(`Invalid UnitElement string given: could not parse "${str}".`)

	// Turn the outcome into an object.
	const processedData = interpretUnitString(match[1])
	return {
		prefix: processedData.prefix.str,
		unit: processedData.unit.str,
		power: match[3] || 1,
	}
}
module.exports.stringToSO = stringToSO

// process takes a simple unit element value of the form { text: 'kOhm', power: '2' } and optionally also a cursor { part: 'text', cursor: 4 }. It processes it into an object that can be displayed. So you get { value: { prefix: 'k', unit: 'Ω', power: '2' }, cursor: { part: 'text', cursor: 2 } }. If it is invalid, the flag "invalid" will be added and set to true.
function process(value, cursor) {
	const { text, power } = value
	const { prefix, unit, valid } = interpretUnitString(text)

	// Determine if the cursor needs to shift.
	if (cursor && cursor.part === 'text') {
		if (cursor.cursor > 0 && cursor.cursor <= prefix.original.length) { // Was the cursor in the prefix?
			if (prefix.original.length !== prefix.str.length) // Did the prefix length change?
				cursor = { ...cursor, cursor: prefix.str.length } // Put the cursor at the end of the adjusted part.
		} else if (cursor.cursor > prefix.original.length) { // The cursor was in the unit.
			if (unit.original.length !== unit.str.length) // Did the unit length change?
				cursor = { ...cursor, cursor: prefix.str.length + unit.str.length } // Put the cursor at the end of the adjusted part.
			else if (prefix.original.length !== prefix.str.length) // Did the prefix length change?
				cursor = { ...cursor, cursor: cursor.cursor - (prefix.original.length - prefix.str.length) } // Shift the cursor to the left by how much the prefix shortened.
		}
	}

	// Return all required data.
	const processedValue = {
		prefix: prefix.str,
		unit: unit.str,
		power,
	}
	if (!valid)
		processedValue.invalid = true
	return {
		value: processedValue,
		cursor,
	}
}
module.exports.process = process

// interpretUnitString interpets a text as a unit with prefix. It returns an object of the form { prefix: { obj, str, original }, unit: { obj, str, original }, valid }. The obj will be a functional prefix or unit object, or null if nothing is found. The original parameter will be the original string from which this was found. The str parameter is the processed string for the prefix or unit (so μ instead of mu, or Ω instead of Ohm). It equals the original if nothing is found. The parameter valid will be a boolean.
function interpretUnitString(text) {
	// Try to find the unit directly from the string.
	let unit = findUnit(text)
	if (unit)
		return {
			prefix: { obj: null, str: '', original: '' },
			unit: { obj: unit, str: unit.letter, original: text },
			valid: true,
		}

	// No unit found yet. Try to pull off a prefix. First check: do any prefixes match?
	const matchingPrefixes = Object.values(prefixes).filter(prefix => prefix.getPrefixString(text))
	if (matchingPrefixes.length === 0)
		return {
			prefix: { obj: null, str: '', original: '' },
			unit: { obj: null, str: text, original: text },
			valid: false,
		}

	// We matched a prefix! (One or more.) Let's see if we can match a unit with the remainder.
	const prefixesWithUnits = matchingPrefixes.filter(prefix => {
		const unitStr = prefix.getStringWithoutPrefix(text)
		return unitStr && findUnit(unitStr)
	})
	const valid = prefixesWithUnits.length > 0

	// Assemble return data.
	const prefix = valid ? prefixesWithUnits[0] : matchingPrefixes[0]
	const prefixStr = prefix.getPrefixString(text)
	const unitStr = text.slice(prefixStr.length)
	unit = valid ? findUnit(unitStr) : null
	return {
		prefix: { obj: prefix, str: prefix.letter, original: prefixStr },
		unit: { obj: unit, str: unit ? unit.letter : unitStr, original: unitStr },
		valid,
	}
}
module.exports.interpretUnitString = interpretUnitString

// The following functions are obligatory functions.
function isFOofType(param) {
	return isObject(param) && param.constructor === UnitElement
}
module.exports.isFOofType = isFOofType

function FOtoIO(param) {
	// Check if we have a UnitElement object already. If not, turn it into one. (Or die trying.)
	if (param.constructor !== UnitElement)
		param = new UnitElement(param)

	// Find a way to display the unit element.
	const result = {
		prefix: param.prefixString,
		unit: param.unitString,
		power: param.power === 1 ? '' : param.power.toString(),
	}
	if (!param.isValid())
		result.invalid = true
	return result
}
module.exports.FOtoIO = FOtoIO

function IOtoFO(value) {
	// Grab the number and the power. Take into account a few boundary cases.
	let { prefix, unit, power } = value
	power = (power === '' || power === '-' ? 1 : parseInt(power))

	// Set up a unit element with the given properties.
	return new UnitElement({
		prefix,
		unit,
		power,
	})
}
module.exports.IOtoFO = IOtoFO

function getEmpty() {
	return { prefix: '', unit: '', power: '', invalid: true }
}
module.exports.getEmpty = getEmpty

function isEmpty(value) {
	return value.prefix === '' && value.unit === '' && value.power === ''
}
module.exports.isEmpty = isEmpty

function equals(a, b) {
	throw new Error(`The equals method is not implemented for unit elements.`)
}
module.exports.equals = equals