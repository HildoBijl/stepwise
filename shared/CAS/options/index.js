
module.exports = {
	// Load in files with default exports.
	bracketLevels: require('./bracketLevels'),
	equalityLevels: require('./equalityLevels'),

	// Load in files with multiple exports that should be grouped.
	simplifyOptions: { ...require('./simplifyOptions') },

	// Load in other options, which all need to be exported.
	...require('./otherOptions'),
}