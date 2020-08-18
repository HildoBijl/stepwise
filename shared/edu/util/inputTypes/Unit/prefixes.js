const { Prefix } = require('./Prefix')

// General overview of all prefixes.
const prefixList = [
	new Prefix({ letter: 'y', name: 'yocto', power: -24, }),
	new Prefix({ letter: 'z', name: 'zepto', power: -21, }),
	new Prefix({ letter: 'a', name: 'atto', power: -18, }),
	new Prefix({ letter: 'f', name: 'femto', power: -15, }),
	new Prefix({ letter: 'p', name: 'pico', power: -12, }),
	new Prefix({ letter: 'n', name: 'nano', power: -9, }),
	new Prefix({ letter: 'μ', alternatives: 'mu', name: 'micro', power: -6, }),
	new Prefix({ letter: 'm', name: 'milli', power: -3, }),
	new Prefix({ letter: 'c', name: 'centi', power: -2, }),
	new Prefix({ letter: 'd', name: 'deci', power: -1, }),
	new Prefix({ letter: 'da', name: 'deca', power: 1, }),
	new Prefix({ letter: 'h', name: 'hecto', power: 2, }),
	new Prefix({ letter: 'k', name: 'kilo', power: 3, }),
	new Prefix({ letter: 'M', name: 'mega', power: 6, }),
	new Prefix({ letter: 'G', name: 'giga', power: 9, }),
	new Prefix({ letter: 'T', name: 'tera', power: 12, }),
	new Prefix({ letter: 'P', name: 'peta', power: 15, }),
	new Prefix({ letter: 'E', name: 'exa', power: 18, }),
	new Prefix({ letter: 'Z', name: 'zetta', power: 21, }),
	new Prefix({ letter: 'Y', name: 'yotta', power: 24, }),
]

// Turn the prefix list into an object with the letter as key.
const prefixes = {}
prefixList.forEach(prefix => prefixes[prefix.letter] = prefix)
module.exports.prefixes = prefixes

// Find which prefix corresponds to the given text, taking into account alternatives. Return null when nothing is found.
function findPrefix(str) {
	// Try to find the prefix by the key.
	if (prefixes[str])
		return prefixes[str]

	// Try to find the prefix by the alternatives.
	return Object.values(prefixes).find(prefix => prefix.equalsString(str)) || null
}
module.exports.findPrefix = findPrefix