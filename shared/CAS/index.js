// Load in all folders in the right order.
const options = require('./options')
const functionalities = require('./functionalities')
const interpretation = require('./interpretation')

// Assemble all exports.
module.exports = {
	// Export all options as an options object.
	options: { ...options },

	// Specifically export important options.
	simplifyOptions: options.simplifyOptions,

	// Export expressionSubtypes, both as separate object (for iterating) and as separate elements (for easy importing).
	expressionSubtypes: functionalities.expressionSubtypes,
	...functionalities.expressionSubtypes,

	// Export other important CAS functionalities.
	Expression: functionalities.Expression,
	expressionComparisons: functionalities.expressionComparisons,
	expressionChecks: functionalities.expressionChecks,
	Equation: functionalities.Equation,
	equationComparisons: functionalities.equationComparisons,
	equationChecks: functionalities.equationChecks,

	// Export all important interpretation functions.
	...interpretation,
}

// Improve the ensureExpression and ensureEquation functions, incorporating the interpretation functionalities too. If something is a string, try to turn it into an Expression/Equation.
function ensureExpression(expression) {
	if (typeof expression === 'string')
		return interpretation.asExpression(expression)
	return functionalities.ensureExpression(expression)
}
module.exports.ensureExpression = ensureExpression
function ensureEquation(equation) {
	if (typeof equation === 'string')
		return interpretation.asEquation(equation)
	return functionalities.ensureEquation(equation)
}
module.exports.ensureEquation = ensureEquation
