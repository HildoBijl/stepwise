// Unit represents any unit a physical quantity may have. For example mg^3 * kl / ns^2 * °C^2.

const { ensureInt, isObject, deepEquals, keysToObject, processOptions, InterpretationError } = require('../../util')

const { UnitElement } = require('./UnitElement')
const { getUnitArrayFO } = require('./UnitArray')

const unitColor = '#044488' // The color in which units are printed within Tex. It cannot be imported from the theme because this file is in the shared directory.

const defaultUnit = { num: [], den: [] }
const parts = Object.keys(defaultUnit)

class Unit {
	// The constructor input is either a string like "mg^3 * kl / ns^2 * °C^2", or an object with a "num" and a "den" property. In this latter case these properties should either be unit strings like "mg^3 * kl" or arrays of something the UnitElement constructor takes.

	constructor(input = {}) {
		// If we have a type Unit, use it.
		if (isObject(input) && input.constructor === Unit)
			return input

		// If we have a string, split it up into an object first.
		if (typeof input === 'string')
			input = splitUnitString(input)

		// Include default values.
		input = processOptions(input, defaultUnit)

		// Deal with each part separately.
		this._num = getUnitArrayFO(input.num)
		this._den = getUnitArrayFO(input.den)
	}

	// SO returns a storage object representation of this unit that can be interpreted again.
	get SO() {
		return keysToObject(parts, part => this[part].length === 0 ? undefined : this[part].map(unitElement => unitElement.SO))
	}

	get type() {
		return 'Unit'
	}

	// num returns an array of unit elements in the numerator. Be careful with this: don't adjust them directly.
	get num() {
		return this._num
	}

	// den returns an array of unit elements in the denominator. Be careful with this: don't adjust them directly.
	get den() {
		return this._den
	}

	// str returns a string representation of this unit.
	get str() {
		return this.toString()
	}

	// toString returns a string representation of the unit.
	toString() {
		let str = this._num.map(unitElement => unitElement.str).join(' * ')
		if (this._den.length > 0) {
			str += ' / '
			str += this._den.map(unitElement => unitElement.str).join(' * ')
		}
		return str
	}

	get tex() {
		let str = this._num.map(unitElement => unitElement.tex).join(' \\cdot ')
		if (this._den.length > 0) {
			const den = this._den.map(unitElement => unitElement.tex).join(' \\cdot ')
			return `\\frac{\\color{${unitColor}} ${str}}{\\color{${unitColor}} ${den}}`
		}
		if (str.length === 0)
			return ''
		return `{\\color{${unitColor}}${str}}`
	}

	get texWithBrackets() {
		return `\\left[${this.tex || '-'}\\right]`
	}

	// isEmpty checks whether the unit is empty or not.
	isEmpty() {
		return this._num.length === 0 && this._den.length === 0
	}

	// isValid returns whether we have a valid unit (true or false). So whether all unit elements in this unit are valid unit elements: whether they have been recognized.
	isValid() {
		return this.getInvalidUnitElement() === undefined
	}

	// getInvalid returns a unitElement that is invalid, or undefined if all are valid.
	getInvalidUnitElement() {
		return this._num.find(unitElement => !unitElement.isValid()) || this._den.find(unitElement => !unitElement.isValid())
	}

	// isInStandardUnits returns whether the unit only uses standard units.
	isInStandardUnits() {
		return this._num.every(unitElement => unitElement.isInStandardUnits()) && this._den.every(unitElement => unitElement.isInStandardUnits())
	}

	/* simplify simplifies a unit, removing prefixes from all unit elements, sorting out the order and removing duplicate units. Various options can be passed along:
	 * - type (default 2): 
	 *   0 (Unit.simplifyType.doNothing): don't simplify anything.
	 *   1 (Unit.simplifyType.removePrefixes): remove the prefixes, turning dl into l.
	 *   2 (Unit.simplifyType.toStandardUnits): go to standard units, turning l into m^3.
	 *   3 (Unit.simplifyType.toBaseUnits): go to base units, turning C into A*s.
	 * - clean (default true): should we clean/sort out unit elements in the end? That is, rewrite "m*N" as "N*m" and similar? This also includes power simplifications, reducing m^5 / m^3 to m^2.
	 * It does not adjust this object but returns a copy.
	 */
	simplify(options = {}) {
		return this.simplifyWithData(options).simplification
	}

	/* simplifyWithData does the same as simplify, but it returns more data. It returns an object with the parameters:
	 * - simplification: the simplified object.
	 * - power: the power that needs to be added to the power of the number. For instance, bar * km / ms will give a power of 11 (5 from bar, 3 from k and 3 from m).
	 * - factor: the factor that the number needs to be multiplied with. For instance, degrees will give a factor of pi/180 when converting to radians.
	 * - difference: the value that needs to be added to the number. For instance, degrees Celsius will give a difference of 273.15 when converting to Kelvin.
	 */
	simplifyWithData(options = {}) {
		// Fill out any missing options with defaults.
		options = processOptions(options, Unit.defaultSimplifyOptions)

		// Check if the unit is a valid one. We cannot simplify it otherwise.
		if (!this.isValid())
			throw new Error(`Invalid unit error: trying to simplify an invalid unit. The unit is "${this.str}".`)

		// If we need to do nothing, return the result.
		let data = { simplification: this, difference: 0, factor: 1, power: 0 }
		if (options.type === Unit.simplifyTypes.doNothing && !options.clean) {
			data.simplification = this
			return data
		}

		// First remove all the prefixes, keeping track of the power that we accumulate like this. This should be returned eventually.
		if (options.type >= Unit.simplifyTypes.removePrefixes) {
			data.simplification = new Unit({
				num: data.simplification.num.map(unitElement => {
					data.power += unitElement.getPrefixRemovalPower()
					return unitElement.removePrefix()
				}),
				den: data.simplification.den.map(unitElement => {
					data.power -= unitElement.getPrefixRemovalPower()
					return unitElement.removePrefix()
				}),
			})

			// Turn all units into standard units, if the options dictate so.
			if (options.type >= Unit.simplifyTypes.toStandardUnits) {
				let result = new Unit('')
				data.simplification.num.forEach(unitElement => {
					if (unitElement.unit.standard) { // Is it already a standard unit?
						result.num.push(unitElement)
					} else { // It is not. Make adjustments.
						const unitAdjustments = unitElement.unit.toStandard
						data.difference += unitAdjustments.difference || 0
						data.factor *= Math.pow(unitAdjustments.factor, unitElement.power) || 1
						data.power += unitAdjustments.power * unitElement.power || 0
						result = result.multiply(new Unit(unitAdjustments.unit).toPower(unitElement.power), false)
					}
				})
				data.simplification.den.forEach(unitElement => {
					if (unitElement.unit.standard) { // Is it already a standard unit?
						result.den.push(unitElement)
					} else { // It is not. Make adjustments.
						const unitAdjustments = unitElement.unit.toStandard
						data.difference -= unitAdjustments.difference || 0
						data.factor /= Math.pow(unitAdjustments.factor, unitElement.power) || 1
						data.power -= unitAdjustments.power * unitElement.power || 0
						result = result.divide(new Unit(unitAdjustments.unit).toPower(unitElement.power), false)
					}
				})
				data.simplification = result

				// Ignore the difference if this is not a basic unit. (For example, when going from °C to K, we must use a difference. But when going from J/°C to J/K we must not.)
				if (this._num.length !== 1 || this._den.length !== 0 || this._num[0].power !== 1)
					data.difference = 0

				// Turn all (standard) units into base units, if the options dictate so. In this case we do not keep track of adjustments, because there won't be any. (That's the whole idea behind standard units.)
				if (options.type >= Unit.simplifyTypes.toBaseUnits) {
					let result = new Unit('')
					data.simplification.num.forEach(unitElement => {
						if (unitElement.unit.base) {
							result.num.push(unitElement)
						} else {
							result = result.multiply(new Unit(unitElement.unit.toBase).toPower(unitElement.power), false)
						}
					})
					data.simplification.den.forEach(unitElement => {
						if (unitElement.unit.base) {
							result.den.push(unitElement)
						} else {
							result = result.divide(new Unit(unitElement.unit.toBase).toPower(unitElement.power), false)
						}
					})
					data.simplification = result
				}
			}
		}

		// Should we simplify and sort the whole unit?
		if (options.clean) {
			// Make a list of all the units that exist and what power they have.
			const unitPowers = {}
			const addToUnitPowers = (unitElement, positive) => {
				const index = unitElement.getStringWithoutPower()
				if (!unitPowers[index])
					unitPowers[index] = { unit: unitElement.unit, prefix: unitElement.prefix, power: 0 }
				unitPowers[index].power += (positive ? 1 : -1) * unitElement.power
			}
			data.simplification.num.forEach(unitElement => addToUnitPowers(unitElement, true))
			data.simplification.den.forEach(unitElement => addToUnitPowers(unitElement, false))

			// Then sort the list, based on the unit order, the unit letter and the prefix power.
			const sortFunction = (a, b) => {
				const unitA = unitPowers[a].unit
				const unitB = unitPowers[b].unit
				if (unitA.order !== unitB.order)
					return unitA.order - unitB.order
				if (unitA.letter !== unitB.letter)
					return unitA.letter.toLowerCase() > unitB.letter.toLowerCase() ? 1 : -1
				const prefixA = unitPowers[a].prefix
				const prefixB = unitPowers[b].prefix
				if (prefixA.power !== prefixB.power)
					return prefixA.power - prefixB.power
				throw new Error(`Invalid unit simplification: could not compare unit elements "${a}" and "${b}" with each other.`)
			}
			data.simplification = new Unit({
				num: Object.keys(unitPowers).filter(index => unitPowers[index].power > 0).sort(sortFunction).map(index => new UnitElement(`${index}^${unitPowers[index].power}`)),
				den: Object.keys(unitPowers).filter(index => unitPowers[index].power < 0).sort(sortFunction).map(index => new UnitElement(`${index}^${-unitPowers[index].power}`)),
			})
		}

		// All done!
		return data
	}

	/* equals compares two units, checking if they're equal, returning true or false. It can get an object with options as second parameter. These options include:
	 * - type (default 3): 
	 *   0 (Unit.equalityTypes.exact): require exactly the same unit. So N * m and m * N are different.
	 *   1 (Unit.equalityTypes.sameUnitsAndPrefixes): allow other orders, but keeping the same prefixes. So kg * s and s * kg are equal, but kg * s and g * ks are not equal.
	 *   2 (Unit.equalityTypes.sameUnits): allow any order and shifting of prefixes, but keep the same unit. So kg * s and g * ks are equal. Also, km / s and m / ms are equal. But turning N into kg * m / s^2 is not allowed.
	 *   3 (Unit.equalityTypes.free): any units that are equal in some way are considered equal. So N and kg * m / s^2 are equal.
	 * - checkSize (default true): should we consider m and km equal? This only applies from type 2 and above. For type 0 and 1 size must always be equal, because prefixes must always be equal.
	 */
	equals(x, options = {}) {
		// If constructors don't match, no comparison is possible.
		if (this.constructor !== x.constructor)
			throw new Error(`Invalid comparison: cannot compare an object of type "${this.constructor.name || 'unknown'}" with an object of type "${x.constructor.name || 'unknown'}".`)

		// Fill out any missing options with defaults.
		options = processOptions(options, Unit.defaultComparison)

		// Set up easier names.
		let a = this
		let b = x

		// Ensure validity of both units.
		if (!a.isValid()) {
			if (b.isValid())
				return false // One is valid, the other is not.
			return deepEquals(a.SO, b.SO) // We have invalid units: just do a deepEquals.
		}
		if (!b.isValid())
			return false

		// Simplify the units based on the given options.
		const simplifyOptions = equalityTypeToSimplifyOptions(options.type)
		const aData = a.simplifyWithData(simplifyOptions)
		const bData = b.simplifyWithData(simplifyOptions)
		if (options.checkSize) {
			if (aData.difference !== bData.difference)
				return false
			if (aData.factor !== bData.factor)
				return false
			if (aData.power !== bData.power)
				return false
		}

		// To check for equality, we just compare string representations. This should be sufficient.
		return aData.simplification.str === bData.simplification.str
	}

	// Invert turns this unit into 1/this unit. So it flips the numerator and the denominator.  It does not adjust this object but returns a copy.
	invert() {
		return new Unit({
			num: this.den,
			den: this.num,
		})
	}

	// multiply will multiply this unit by the given unit. So kg/s multiplied by s/N will become kg * s / s * N. (Simplification is not automatically done.) It does not adjust this object but returns a copy.
	multiply(unit, simplify = true) {
		const result = new Unit({
			num: [...this.num, ...unit.num],
			den: [...this.den, ...unit.den],
		})
		return simplify ? result.simplify({ type: 0, clean: true }) : result
	}

	// divide will divide this unit by the given unit. So (m^3/s) / (kg/s) will become (m^3 * s) / (s * kg). No simplification is performed. It does not adjust this object but returns a copy.
	divide(unit, simplify) {
		return this.multiply(unit.invert(), simplify)
	}

	// toPower will take this unit to the given power. So (m/s^2)^3 will become (m^3/s^6). It does not adjust this object but returns a copy.
	toPower(power) {
		power = ensureInt(power)
		if (power === 0)
			return new Unit()
		if (power < 0)
			return this.invert().toPower(-power)
		return new Unit({
			num: this.num.map(unitElement => unitElement.toPower(power)),
			den: this.den.map(unitElement => unitElement.toPower(power)),
		})
	}
}
module.exports.Unit = Unit

// Define simplify types.
Unit.simplifyTypes = {
	doNothing: 0,
	removePrefixes: 1,
	toStandardUnits: 2,
	toBaseUnits: 3,
}
Unit.defaultSimplifyOptions = {
	type: Unit.simplifyTypes.toStandardUnits,
	clean: true,
}

// Define equality check types.
Unit.equalityTypes = {
	exact: 0,
	sameUnitsAndPrefixes: 1,
	sameUnits: 2,
	free: 3,
}
Unit.defaultComparison = {
	type: Unit.equalityTypes.free,
	checkSize: true,
}
function equalityTypeToSimplifyOptions(type) {
	if (type === Unit.equalityTypes.exact) {
		return {
			type: Unit.simplifyTypes.doNothing,
			clean: false,
		}
	}
	if (type === Unit.equalityTypes.sameUnitsAndPrefixes) {
		return {
			type: Unit.simplifyTypes.doNothing,
			clean: true,
		}
	}
	if (type === Unit.equalityTypes.sameUnits) {
		return {
			type: Unit.simplifyTypes.removePrefixes,
			clean: true,
		}
	}
	if (type === Unit.equalityTypes.free) {
		return {
			type: Unit.simplifyTypes.toBaseUnits,
			clean: true,
		}
	}
	throw new Error(`Invalid unit equals type: received "${type}" which is not a known type.`)
}
module.exports.equalityTypeToSimplifyOptions = equalityTypeToSimplifyOptions

// unitsSimilar checks if units are similar enough to be turned into each other.
function unitsSimilar(a, b) {
	if (!(a instanceof Unit) || !(b instanceof Unit))
		throw new Error(`Invalid Unit: the function unitsSimilar was called and given an input that was not a unit.`)
	return a.equals(b, { type: Unit.equalityTypes.free, checkSize: false })
}
module.exports.unitsSimilar = unitsSimilar

// splitUnitString takes a unit like "m * kg / N^2 * m^2" and splits it up into an object { num: "m * kg", den: "N^2 * m^2" } with numerator and denominator strings.
function splitUnitString(str) {
	// Do a separate bracket check. We don't need this for the functionality, but it's nice to show more helpful errors.
	if (str.includes('(') || str.includes(')'))
		throw new Error(`Invalid unit input: received a unit with brackets. Brackets are not necessary in units. Enter them like "N * m^2 / kg * K". The received input, with brackets, was "${str}".`)

	// Split the string up based on dividers "/" and process each part separately.
	const strSplit = str.split('/')
	if (strSplit.length > 2)
		throw new Error(`Invalid unit input: expected a unit like "N*m" or "m/s", but found too many dividers "/". Only one (or none) is needed/allowed. Received input was "${str}".`)

	return {
		num: strSplit[0],
		den: strSplit[1] || '',
	}
}
module.exports.splitUnitString = splitUnitString

// The functions below describe how to transfer between various data types, other than the standard ways in which this is done.

module.exports.SOtoFO = (SO) => {
	const unit = new Unit(SO)
	const invalidUnitElement = unit.getInvalidUnitElement()
	if (invalidUnitElement !== undefined)
		throw new InterpretationError(`InvalidUnit`, invalidUnitElement, 'Received a unit with invalid/unrecognized unit elements.')
	return unit
}
module.exports.SItoFO = module.exports.SOtoFO // For units SI and SO are the same.
