// UnitElement represents a single term in a Unit. Something like km^3, mV^2 or even m°C^2, but not a composed unit like m/s. Only positive powers are allowed, because negative powers are fixed within the Unit class. Zero powers are also not allowed (pointless anyway).

const { isInt, ensureInt } = require('../../util/numbers')
const { keysToObject, processOptions } = require('../../util/objects')
const { Prefix } = require('./Prefix')
const { BaseUnit } = require('./BaseUnit')
const { prefixes, findPrefix } = require('./prefixes')
const { specialUnitSymbols, findUnit } = require('./units')

// const inputFormat = RegExp(`^(?<unitText>[a-zA-Z${specialUnitSymbols.join('')}]+)(?:\\^(?<power>\\d+))?$`) // Firefox doesn't support named capture groups.
const inputFormat = RegExp(`^([a-zA-Z${specialUnitSymbols.join('')}]+)(\\^(\\d+))?$`)

const defaultUnitElement = { prefix: '', unit: '', power: 1 }
const parts = Object.keys(defaultUnitElement)

class UnitElement {
	// The constructor input can be of the form string or SO. A string is like "km^3" and a Storage Object is of the form { prefix: 'mu', unit: 'm', power: 2 }. All parameters in this form are optional. Defaults are empty string for the prefix and unit and 1 for the power.

	constructor(input = {}) {
		// If we already have a UnitElement, use it.
		if (input instanceof UnitElement)
			return input

		// If we have a string, turn it to an object.
		if (typeof input === 'string')
			input = interpretStr(input)

		// Include default values.
		const { prefix, unit, power } = processOptions(input, defaultUnitElement)

		// Process the prefix.
		if (prefix instanceof Prefix || prefix === null) {
			this._prefix = prefix
		} else {
			if (typeof prefix !== 'string')
				throw new Error(`Invalid prefix given: only prefixes of type string are allowed, but the prefix given was of type "${typeof prefix}".`)
			if (prefix.length > 0) {
				this._prefix = findPrefix(prefix)
				if (!this._prefix)
					throw new Error(`Unknown prefix given: did not recognize prefix "${prefix}".`)
			}
		}

		// Process the unit.
		if (unit instanceof BaseUnit || unit === null) {
			this._unit = unit
		} else {
			if (typeof input.unit !== 'string')
				throw new Error(`Invalid unit given: only units of type string are allowed, but the unit given was of type "${typeof unit}".`)
			this._unit = findUnit(unit) || unit // Try to turn it into a known unit object. If this fails, keep the string.
		}

		// Process the power.
		if (power === '')
			this._power = 1
		else if (!isInt(power) || power <= 0)
			throw new Error(`Invalid power given: no non-positive powers are allowed for units, but received "${power}".`)
		else
			this._power = parseInt(power)
	}

	// SO gives a storage object representation, containing only the relevant data. It has no attached methods, like this class.
	get SO() {
		return keysToObject(parts, part => {
			if (part === 'power')
				return this.power === 1 ? undefined : this.power
			return this[`${part}String`] || undefined
		})
	}

	get type() {
		return 'UnitElement'
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

	// str returns a string representation of this number.
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

	// removePrefix removes the prefix for this unit element. (Unless the unit has a standard prefix, like kg, in which case the prefix is set to that default prefix.) It does not adjust this object but returns a copy.
	removePrefix() {
		return new UnitElement({
			prefix: this.isValid() && this.unit.defaultPrefix ? this.unit.defaultPrefix.letter : '',
			unit: this.unitString,
			power: this.power,
		})
	}

	// getPrefixRemovalPower returns the power that this unit element changes by when we remove the prefix (put it to its default value). For instance, simplifying "km^2" will give a power of 6, since it's 10^6" times larger than the end-result "m^2".
	getPrefixRemovalPower() {
		return (this.prefixPower - (this.isValid() && this.unit.defaultPrefixPower || 0)) * this.power
	}

	// toPower takes this unit element to the given power. For instance, if we have 'km^3' and take it to power 4, we will get (km^3)^4 = km^12. It does not adjust this object but returns a copy.
	toPower(power) {
		power = ensureInt(power, true, true)
		return new UnitElement({
			prefix: this.prefixString,
			unit: this.unitString,
			power: this.power * power,
		})
	}
}
module.exports.UnitElement = UnitElement

// interpretStr turns a string representation of a unit element to an object that can easily be interpreted. So it turns "km^2" into { prefix: "k", unit: "m", power: 2 }. It uses object references to prefixes/base units where possible.
function interpretStr(str) {
	// An empty string is allowed. If we have this, just use default properties.
	str = str.trim()
	if (str === '')
		return {}

	// Check if the string has the required format.
	let match = inputFormat.exec(str)
	if (!match)
		throw new Error(`Invalid UnitElement string given: could not parse "${str}".`)

	// Turn the outcome into an object.
	const processedData = interpretPrefixAndBaseUnitStr(match[1])
	return {
		prefix: processedData.prefix.obj,
		unit: processedData.unit.obj,
		power: match[3] || 1,
	}
}
module.exports.interpretStr = interpretStr

// interpretPrefixAndBaseUnitStr interpets a text as a unit with prefix. It returns an object of the form { prefix: { obj, str, original }, unit: { obj, str, original }, valid }. The obj will be a functional prefix or unit object, or null if nothing is found. The original parameter will be the original string from which this was found. The str parameter is the processed string for the prefix or unit (so μ instead of mu, or Ω instead of Ohm). It equals the original if nothing is found. The parameter valid will be a boolean.
function interpretPrefixAndBaseUnitStr(text) {
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
module.exports.interpretPrefixAndBaseUnitStr = interpretPrefixAndBaseUnitStr
