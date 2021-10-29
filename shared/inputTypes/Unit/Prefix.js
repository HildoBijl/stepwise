/*
 * Prefix represents a prefix type, like 'k' (kilo), 'm' (milli), 'da' (deca) etcetera. It should receive a data object with various parameter.
 * letter (mandatory): something like 'k' or 'da'.
 * name (mandatory): something like 'kilo' or 'deca'.
 * power (mandatory): the corresponding power, like -3 for 'm'.
 * alternatives: an array of alternatives that can also be used, like 'mu' instead of 'μ'.
 */

import { isInt } from '../../util/numbers'

export class Prefix {
	/* The constructor must contain all required prefix data, being:
	 * - letter: a string like "k" or "da".
	 * - name: the name, like "kilo" or "deca".
	 * - power: an integer (or integer string) like 3, 1 or -6.
	 * - alternatives [optional]: an array of alternative representations. Like "°C" which can also be written as "dC" or "degC".
	 */

	constructor(data = {}) {
		// Check the input.
		if (typeof (data) !== 'object')
			throw new Error(`Invalid prefix input: should be given an object, but received a parameter with type "${typeof (data)}".`)
		if (data.letter === undefined || typeof data.letter !== 'string')
			throw new Error(`Invalid prefix input: should be given an object with string parameter "letter", but was given "${JSON.stringify(data)}".`)
		if (data.name === undefined || typeof data.name !== 'string')
			throw new Error(`Invalid prefix input: should be given an object with string parameter "name", but was given "${JSON.stringify(data)}".`)
		if (data.power === undefined || !isInt(data.power))
			throw new Error(`Invalid prefix input: should be given an object with integer parameter "power", but was given "${JSON.stringify(data)}".`)

		// Store mandatory parameters.
		this._letter = data.letter
		this._name = data.name
		this._power = parseInt(data.power)

		// Store optional parameters.
		if (data.alternatives) {
			if (!Array.isArray(data.alternatives)) {
				this._alternatives = [data.alternatives] // Ensure that the alternatives are always an array.
			} else {
				this._alternatives = data.alternatives
			}
		}
	}

	get letter() {
		return this._letter
	}

	get name() {
		return this._name
	}

	get power() {
		return this._power
	}

	get alternatives() {
		return this._alternatives || []
	}

	get str() {
		return this.toString()
	}

	toString() {
		return this.letter
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

	// getStringWithoutPrefix checks if the prefix opens up the given string. If so, it removes the prefix and returns the remainder. If not, it returns undefined. For instance, for a prefix 'μ' with alternative 'mu', the string "μXXX" and "muXXX" both return "XXX", but "Xμ" and "X" will return undefined.
	getStringWithoutPrefix(str) {
		// Did we find something?
		const prefix = this.getPrefixString(str)
		if (!prefix)
			return undefined
		return str.slice(prefix.length)
	}

	// getPrefixString checks if the prefix opens up the given string. If so, it returns the representation of the prefix which does so. Otherwise it gives undefined. For instance, for a prefix 'μ' with alternative 'mu', the string "μXXX" and "muXXX" return "μ" and "mu", respectively, but "Xμ" and "X" will return undefined.
	getPrefixString(str) {
		// Check input.
		if (typeof str !== 'string')
			throw new Error(`Invalid input: a string was expected, but received input type "${typeof str}".`)

		// Find the prefix.
		const options = [this.letter].concat(this.alternatives)
		return options.find(option => str.startsWith(option))
	}
}
