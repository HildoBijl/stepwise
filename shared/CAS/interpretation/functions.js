
const { Fraction, Ln, Log, Sqrt, Root, Sin, Cos, Tan, Arcsin, Arccos, Arctan } = require('../functionalities')

const { getEmptyExpression, getExpressionWithValue } = require('./support')

// Define all the basic and advanced functions and all accents that are recognized.
const basicFunctionComponents = {
	ln: Ln,
	sin: Sin,
	cos: Cos,
	tan: Tan,
	asin: Arcsin,
	acos: Arccos,
	atan: Arctan,
	arcsin: Arcsin,
	arccos: Arccos,
	arctan: Arctan,
}
module.exports.basicFunctionComponents = basicFunctionComponents
module.exports.basicFunctions = Object.keys(basicFunctionComponents)

const advancedFunctionComponents = {
	frac: {
		component: Fraction,
		defaultArguments: [getEmptyExpression(), getEmptyExpression()],
	},
	subSup: {
		// Does not have a component. It's interpreted separately.
		hasParameterAfter: false,
		defaultArguments: [getEmptyExpression(), getEmptyExpression()],
	},
	log: {
		component: Log,
		hasParameterAfter: true,
		defaultArguments: [getEmptyExpression(), getExpressionWithValue('10')],
	},
	sqrt: {
		component: Sqrt,
		defaultArguments: [getEmptyExpression()],
	},
	root: {
		component: Root,
		defaultArguments: [getEmptyExpression(), getExpressionWithValue('2')],
	},
}
module.exports.advancedFunctionComponents = advancedFunctionComponents
module.exports.advancedFunctions = Object.keys(advancedFunctionComponents)

const accents = ['dot', 'hat']
module.exports.accents = accents

// isFunctionAllowed takes a function name (like "log") and an ExpressionInput settings object, and checks if the function is allowed, given the settings.
function isFunctionAllowed(func, settings) {
	if (func === 'frac')
		return settings.divide
	if (func === 'subSup')
		return settings.power || settings.subscript
	if (func === 'sin' || func === 'cos' || func === 'tan' || func === 'asin' || func === 'acos' || func === 'atan' || func === 'arcsin' || func === 'arccos' || func === 'arctan')
		return settings.trigonometry
	if (func === 'sqrt' || func === 'root')
		return settings.root
	if (func === 'ln' || func === 'log')
		return settings.logarithm
	return false
}
module.exports.isFunctionAllowed = isFunctionAllowed