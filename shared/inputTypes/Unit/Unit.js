// Unit represents any unit a physical quantity may have. For example mg^3 * kl / ns^2 * °C^2.

const { isObject, deepEquals, processOptions } = require('../../util/objects')
const { UnitElement } = require('./UnitElement')
const { getUnitArrayFO, isFOofType: isFOofTypeUnitArray, FOtoIO: unitArrayFOtoIO, IOtoFO: unitArrayIOtoFO, getEmpty: getEmptyUnitArray, isEmpty: isUnitArrayEmpty } = require('./UnitArray')

const defaultEqualityOptions = {
	compareOrder: false,
	comparePrefixes: false,
	compareSize: true,
	simplifyUnit: true,
}
module.exports.defaultEqualityOptions = defaultEqualityOptions

class Unit {
	// The constructor input is either a string like "mg^3 * kl / ns^2 * °C^2", or an object with a "num" and a "den" property. In this latter case these properties should either be unit strings like "mg^3 * kl" or arrays of something the UnitElement constructor takes.

	constructor(input = {}) {
		// If we have a type Unit, just copy it.
		if (isObject(input) && input.constructor === Unit)
			return this.become(input)

		// If we have a string, split it up into an object first.
		if (typeof input === 'string')
			input = splitUnitString(input)

		// Include default values.
		input = processOptions(input, { num: [], den: [] })

		// Deal with each part separately.
		this._num = getUnitArrayFO(input.num)
		this._den = getUnitArrayFO(input.den)
	}

	// num returns an array of unit elements in the numerator. Be careful with this: don't adjust them directly.
	get num() {
		return this._num
	}

	// den returns an array of unit elements in the denominator. Be careful with this: don't adjust them directly.
	get den() {
		return this._den
	}

	// string returns a string representation of this unit.
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
			str = `\\frac{${str}}{${den}}`
		}
		return str
	}

	// SO returns a storage object representation of this unit that can be interpreted again.
	get SO() {
		return {
			num: this.num.map(unitElement => unitElement.SO),
			den: this.den.map(unitElement => unitElement.SO),
		}
	}

	// clone provides a clone of this object.
	clone() {
		return new this.constructor(this.SO)
	}

	// become turns this object into a clone of the given object.
	become(param) {
		if (!isObject(param) || param.constructor !== Unit)
			throw new Error(`Invalid input: a Unit element cannot become the given object. This object has type "${typeof param}".`)
		this._num = param.num.map(unitElement => unitElement.clone())
		this._den = param.den.map(unitElement => unitElement.clone())
		return this
	}

	// isValid returns whether we have a valid unit (true or false). So whether all unit elements in this unit are valid unit elements: whether they have been recognized.
	isValid() {
		return this._num.every(unitElement => unitElement.isValid()) && this._den.every(unitElement => unitElement.isValid())
	}

	// isInStandardUnits returns whether the unit only uses standard units.
	isInStandardUnits() {
		return this._num.every(unitElement => unitElement.isInStandardUnits()) && this._den.every(unitElement => unitElement.isInStandardUnits())
	}

	// Invert turns this unit into 1/this unit. So it flips the numerator and the denominator. The unit itself is adjusted and returned.
	invert() {
		const temp = this._num
		this._num = this._den
		this._den = temp
		return this
	}

	/* simplify simplifies a unit, removing prefixes from all unit elements, sorting out the order and removing duplicate units. Various options can be passed along:
	 * - removePrefixes (default true): should we get rid of the prefixes?
	 * - toStandardUnits (default true): should we reduce units to standard units? For instance, turning liters into dm^3 (and subsequently to m^3)? This is ignored if prefixes aren't removed. (How would you otherwise transform dl?)
	 * - toBaseUnits (default false): should we reduce units to base units? For instance, reducing N into kg * m / s^2. This is ignored if toStandardUnits is false.
	 * - sortUnits (default true): should we sort units in the end? That is, rewrite "m*N" as "N*m" and similar? This also includes power simplifications, reducing m^5 / m^3 to m^2.
	 * It returns this object itself, allowing for chaining.
	 */
	simplify(options = {}) {
		return this.simplifyWithData(options).simplification
	}

	/* simplifyWithData does the same as simplify, but it returns more data. It returns an object with the parameters:
	 * - simplification: a reference to this object, for easy reference.
	 * - power: the power that needs to be added to the power of the number. For instance, bar * km / ms will give a power of 11 (5 from bar, 3 from k and 3 from m).
	 * - factor: the factor that the number needs to be multiplied with. For instance, degrees will give a factor of pi/180 when converting to radians.
	 * - difference: the value that needs to be added to the number. For instance, degrees Celsius will give a difference of 273.15 when converting to Kelvin.
	 */
	simplifyWithData(options = {}) {
		// Fill out any missing options with defaults.
		const defaultOptions = {
			removePrefixes: true,
			toStandardUnits: true,
			toBaseUnits: false,
			sortUnits: true,
		}
		options = processOptions(options, defaultOptions)

		// Check if the unit is a valid one. We cannot simplify it otherwise.
		if (!this.isValid())
			throw new Error(`Invalid unit error: trying to simplify an invalid unit. The unit is "${this.str}".`)

		// First remove all the prefixes, keeping track of the power that we accumulate like this. This should be returned eventually.
		let data = { simplification: this, difference: 0, factor: 1, power: 0 }
		if (options.removePrefixes) {
			this._num.forEach(unitElement => data.power += unitElement.removePrefix())
			this._den.forEach(unitElement => data.power -= unitElement.removePrefix())

			// Turn all units into standard units, if the options dictate so.
			if (options.toStandardUnits) {
				let result = new Unit('')
				this._num.forEach(unitElement => {
					if (unitElement.unit.standard) { // Is it already a standard unit?
						result.num.push(unitElement.clone())
					} else { // It is not. Make adjustments.
						const unitAdjustments = unitElement.unit.toStandard
						data.difference += unitAdjustments.difference || 0
						data.factor *= unitAdjustments.factor || 1
						data.power += unitAdjustments.power || 0
						result.multiply(new Unit(unitAdjustments.unit).toPower(unitElement.power))
					}
				})
				this._den.forEach(unitElement => {
					if (unitElement.unit.standard) { // Is it already a standard unit?
						result.den.push(unitElement.clone())
					} else { // It is not. Make adjustments.
						const unitAdjustments = unitElement.unit.toStandard
						data.difference -= unitAdjustments.difference || 0
						data.factor /= unitAdjustments.factor || 1
						data.power -= unitAdjustments.power || 0
						result.divide(new Unit(unitAdjustments.unit).toPower(unitElement.power))
					}
				})
				this._num = result.num
				this._den = result.den

				// Ignore the difference if this is not a basic unit. (For example, when going from °C to K, we must use a difference. But when going from J/°C to J/K we must not.)
				if (this._num.length !== 1 || this._den.length !== 0 || this._num[0].power !== 1)
					data.difference = 0

				// Turn all units into base units, if the options dictate so. In this case we do not keep track of adjustments, because there won't be any. (That's the whole idea behind standard units.)
				if (options.toBaseUnits) {
					let result = new Unit('')
					this._num.forEach(unitElement => {
						if (unitElement.unit.base) {
							result.num.push(unitElement.clone())
						} else {
							result.multiply(new Unit(unitElement.unit.toBase).toPower(unitElement.power))
						}
					})
					this._den.forEach(unitElement => {
						if (unitElement.unit.base) {
							result.den.push(unitElement.clone())
						} else {
							result.divide(new Unit(unitElement.unit.toBase).toPower(unitElement.power))
						}
					})
					this._num = result.num
					this._den = result.den
				}
			}
		}

		// Should we simplify and sort the whole unit?
		if (options.sortUnits) {
			// Make a list of all the units that exist and what power they have.
			const unitPowers = {}
			const addToUnitPowers = (unitElement, positive) => {
				const index = unitElement.getStringWithoutPower()
				if (!unitPowers[index])
					unitPowers[index] = { unit: unitElement.unit, prefix: unitElement.prefix, power: 0 }
				unitPowers[index].power += (positive ? 1 : -1) * unitElement.power
			}
			this._num.forEach(unitElement => addToUnitPowers(unitElement, true))
			this._den.forEach(unitElement => addToUnitPowers(unitElement, false))

			// Then sort the list, based on the unit order, the unit letter and the prefix power.
			const sortFunction = (a, b) => {
				const unitA = unitPowers[a].unit
				const unitB = unitPowers[b].unit
				if (unitA.order !== unitB.order)
					return unitA.order - unitB.order
				if (unitA.letter !== unitB.letter)
					return unitA.letter > unitB.letter ? 1 : -1
				const prefixA = unitPowers[a].prefix
				const prefixB = unitPowers[b].prefix
				if (prefixA.power !== prefixB.power)
					return prefixA.power - prefixB.power
				throw new Error(`Invalid unit simplification: could not compare unit elements "${a}" and "${b}" with each other.`)
			}
			this._num = Object.keys(unitPowers).filter(index => unitPowers[index].power > 0).sort(sortFunction).map(index => new UnitElement(`${index}^${unitPowers[index].power}`))
			this._den = Object.keys(unitPowers).filter(index => unitPowers[index].power < 0).sort(sortFunction).map(index => new UnitElement(`${index}^${-unitPowers[index].power}`))
		}

		// All done!
		return data
	}

	/* equals compares two units, checking if they're equal, returning true or false. It can get an object with options as second parameter. These options include:
	 * - compareOrder (default false): should we consider "N*m" equals to "m*N"? And should we consider "m^2/m" equal to "m"? Default we don't compare order and these are equal.
	 * - comparePrefixes (default false): should we consider "m * kg" and "km * g" equal? Default we don't compare prefixes and these are equal.
	 * - compareSize (default true): should we consider "m" and "km" equal? Default we do compare size and these are unequal.
	 * - simplifyUnit (default true): should we consider "Pa" and "N/m^2" equal? This option is ignored if any of the first two options is set to true. Default we do this simplification.
	 */
	equals(x, options = {}) {
		// If constructors don't match, no comparison is possible.
		if (this.constructor !== x.constructor)
			throw new Error(`Invalid comparison: cannot compare an object of type "${this.constructor.name || 'unknown'}" with an object of type "${x.constructor.name || 'unknown'}".`)

		// Fill out any missing options with defaults.
		options = processOptions(options, defaultEqualityOptions)

		// Clone the units to avoid editing the given ones.
		const a = this.clone()
		const b = x.clone()

		// Ensure validity of both units.
		if (!a.isValid()) {
			if (b.isValid())
				return false // One is valid, the other is not.
			return deepEquals(a, b) // We have invalid units: just do a deepEquals.
		}
		if (!b.isValid())
			return false

		// Simplify the units based on the given options.
		const simplifyOptions = {
			removePrefixes: !options.comparePrefixes,
			sortUnits: !options.compareOrder,
			toStandardUnits: (!options.comparePrefixes && !options.compareOrder && options.simplifyUnit),
			toBaseUnits: (!options.comparePrefixes && !options.compareOrder && options.simplifyUnit),
		}
		const aData = a.simplifyWithData(simplifyOptions)
		const bData = b.simplifyWithData(simplifyOptions)
		if (options.compareSize) {
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

	// multiply will multiply this unit by the given unit. So kg/s multiplied by s/N will become kg * s / s * N. (Simplification is not automatically done.) The unit itself is adjusted and returned.
	multiply(unit) {
		unit.num.forEach(unitElement => this._num.push(unitElement.clone()))
		unit.den.forEach(unitElement => this._den.push(unitElement.clone()))
		return this
	}

	// divide will divide this unit by the given unit. So (m^3/s) / (kg/s) will become (m^3 * s) / (s * kg). No simplification is performed. The unit itself is adjusted and returned.
	divide(unit) {
		unit.num.forEach(unitElement => this._den.push(unitElement.clone()))
		unit.den.forEach(unitElement => this._num.push(unitElement.clone()))
		return this
	}

	// toPower will take this unit to the given power. So (m/s^2)^3 will become (m^3/s^6). The unit itself is adjusted and returned.
	toPower(power) {
		this._num.forEach(unitElement => unitElement.toPower(power))
		this._den.forEach(unitElement => unitElement.toPower(power))
		return this
	}
}
module.exports.Unit = Unit

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

// The following functions are obligatory functions.
function isFOofType(unit) {
	return isObject(unit) && unit.constructor === Unit
}
module.exports.isFOofType = isFOofType

function FOtoIO(unit) {
	// Check if we have a Unit object already. If not, turn it into one. (Or die trying.)
	if (unit.constructor !== Unit)
		unit = new Unit(unit)

	// Walk through all the elements and convert them to the right format.
	return {
		num: unitArrayFOtoIO(unit.num),
		den: unitArrayFOtoIO(unit.den),
	}
}
module.exports.FOtoIO = FOtoIO

function IOtoFO(value) {
	return new Unit({
		num: unitArrayIOtoFO(value.num),
		den: unitArrayIOtoFO(value.den),
	})
}
module.exports.IOtoFO = IOtoFO

function getEmpty() {
	return {
		num: getEmptyUnitArray(),
		den: getEmptyUnitArray(),
	}
}
module.exports.getEmpty = getEmpty

function isEmpty(value) {
	return isUnitArrayEmpty(value.num) && isUnitArrayEmpty(value.den)
}
module.exports.isEmpty = isEmpty

function equals(a, b) {
	return IOtoFO(a).equals(IOtoFO(b))
}
module.exports.equals = equals