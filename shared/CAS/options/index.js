const defaultInputSettings = require('./defaultInputSettings')
const defaultInterpretationSettings = require('./defaultInterpretationSettings')
const defaultExpressionSettings = require('./defaultExpressionSettings')

module.exports = {
	// Load in files with default exports.
	bracketLevels: require('./bracketLevels'),
	defaultInputSettings,
	defaultInterpretationSettings,
	defaultExpressionSettings,
	defaultInterpretationExpressionSettings: { ...defaultInterpretationSettings, defaultExpressionSettings },
	defaultFieldSettings: { ...defaultInputSettings, ...defaultInterpretationSettings, ...defaultExpressionSettings },

	// Load in files with multiple exports that should be grouped.
	simplifyOptions: { ...require('./simplifyOptions') },
}