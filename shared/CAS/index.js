// Load in the options first.
const options = require('./options')
const functionalities = require('./functionalities')
const interpretation = require('./interpretation')

// Assemble all exports.
module.exports = {
	// Export all options as an options object.
	options: { ...options },

	// Specifically export important options.
	simplifyOptions: options.simplifyOptions,
	equalityLevels: options.equalityLevels,

	// Export expressionTypes, both as separate object (for iterating) and as separate elements (for easy importing).
	expressionTypes: functionalities.expressionTypes,
	...functionalities.expressionTypes,

	// Export all important interpretation functions.
	...interpretation,
}
