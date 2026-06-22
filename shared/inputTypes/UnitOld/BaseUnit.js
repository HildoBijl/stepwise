// BaseUnit represents a basic type of unit, like m, g, N, Pa, °C, V, etcetera.

class BaseUnit {
	/* The constructor must take an object with all the relevant data. This includes:
	 * - letter: like "g", "cd" or "Ω".
	 * - alternatives [optional]: an array of optional names, like "Ohm".
	 * - name: "gram", "candela" or "Ohm".
	 * - plural: the name when there's multiple elements. Like "radians" instead of "radian". If not given, the default name is also used for plural.
	 * - defaultPrefix [optional]: the prefix which this unit has when being in standard units. For "g" this is prefixes.k. (A prefix object must be given.)
	 * - base [default false]: is this one of the seven base units?
	 * - toBase [required when not a base unit, otherwise ignored]: a unit string that transforms this standard unit to base units.
	 * - standard [default false]: is this a standard unit? ("m" is standard, but "l" is not.)
	 * - toStandard [required when not a standard unit, otherwise ignored]: an object of the form { unit: 'rad', factor: Math.PI/180, power: -3, difference: 273.15 }. The unit is the replacement standard unit. The factor is the multiplication when going to this replacement unit. The power is also added to the already present power. If the unit is on its own (like 20 °C) then the difference is also added.
	 * - order: how should these base units be ordered, when a free ordering can be applied? Defaults are 0 for base units, 1 for standard (non-base) units and 2 for non-standard units. Equal order means ordering is done alphabetically.
	 */

	constructor(data = {}) {
		// Check the input.
		if (typeof (data) !== 'object')
			throw new Error(`Invalid unit input: should be given an object, but received a parameter with type "${typeof (data)}".`)
		if (data.letter === undefined || typeof data.letter !== 'string')
			throw new Error(`Invalid unit input: should be given an object with string parameter "letter", but was given "${JSON.stringify(data)}".`)
		if (data.name === undefined || typeof data.name !== 'string')
			throw new Error(`Invalid unit input: should be given an object with string parameter "name", but was given "${JSON.stringify(data)}".`)
		if (!!data.standard === !!data.toStandard)
			throw new Error(`Invalid unit input: every non-standard unit should have a "toStandard" conversion object, and every standard unit should omit it. The data given was "${JSON.stringify(data)}".`)
		if ((!data.standard || !!data.base) === !!data.toBase)
			throw new Error(`Invalid unit input: every standard and non-base unit should have a "toBase" conversion object, and every other unit should omit it. The data given was "${JSON.stringify(data)}".`)

		// Store mandatory parameters.
		this._letter = data.letter
		this._name = data.name

		// Define default values.
		this._defaultPrefix = null
		this._standard = false
		this._toStandard = null
		this._base = false
		this._toBase = null

		// Store optional parameters.
		if (data.defaultPrefix !== undefined)
			this._defaultPrefix = data.defaultPrefix
		if (data.plural !== undefined)
			this._plural = data.plural

		if (data.standard !== undefined)
			this._standard = data.standard
		if (data.toStandard !== undefined)
			this._toStandard = data.toStandard

		if (data.base !== undefined)
			this._base = data.base
		if (data.toBase !== undefined)
			this._toBase = data.toBase

		if (data.alternatives) {
			if (!Array.isArray(data.alternatives))
				this._alternatives = [data.alternatives] // Ensure that the alternatives are always an array.
			else
				this._alternatives = data.alternatives
		}

		this._order = data.order || (!this.standard * 1 + !this.base * 1)
	}

	get letter() {
		return this._letter
	}

	get name() {
		return this._name
	}

	get plural() {
		return this._plural || this.name
	}

	get defaultPrefix() {
		return this._defaultPrefix
	}

	hasDefaultPrefix() {
		return this._defaultPrefix !== null
	}

	get defaultPrefixPower() {
		return this.hasDefaultPrefix() ? this._defaultPrefix.power : 0
	}

	get alternatives() {
		return this._alternatives || []
	}

	get order() {
		return this._order
	}

	get str() {
		return this.toString()
	}

	toString() {
		return this._letter
	}

	equalsString(str) {
		// Check the given input.
		if (typeof (str) !== 'string')
			throw new Error(`Invalid input: string expected, but received "${str}".`)

		// Check if the string equals the letter or one of the alternatives.
		if (this._letter === str)
			return true
		if (this.alternatives.some(alternative => alternative === str))
			return true

		// Nothing found.
		return false
	}

	get standard() {
		return this._standard
	}

	get toStandard() {
		return this._toStandard
	}

	get base() {
		return this._base
	}

	get toBase() {
		return this._toBase
	}
}
module.exports.BaseUnit = BaseUnit
