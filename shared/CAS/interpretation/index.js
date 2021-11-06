const expression = require('./Expression')
const equation = require('./Equation')

module.exports = {
	// Important expression functions.
	expressionStrToIO: expression.strToIO,
	expressionIOtoFO: expression.IOtoFO,
	asExpression: expression.strToFO,
	interpretExpression: expression.interpret,

	// Important equation functions.
	equationStrToIO: equation.strToIO,
	equationIOtoFO: equation.IOtoFO,
	asEquation: equation.strToFO,
	interpretEquation: equation.interpret,
}
