const expression = require('./Expression')
const equation = require('./Equation')
const support = require('./support')
const functions = require('./functions')
const characterLocalization = require('./characterLocalization')

module.exports = {
	// Important expression functions.
	expressionStrToSI: expression.strToSI,
	expressionSItoFO: expression.SItoFO,
	expressionSOtoFO: expression.SOtoFO,
	asExpression: expression.strToFO,
	interpretExpression: expression.interpret,

	// Important equation functions.
	equationStrToSI: equation.strToSI,
	equationSItoFO: equation.SItoFO,
	equationSOtoFO: equation.SOtoFO,
	asEquation: equation.strToFO,
	interpretEquation: equation.interpret,

	// Export supporting matters as packages.
	support: {
		...support,
		...characterLocalization,
	},
	functions,
}
