const { selectRandomly, getRandomInteger } = require('../../../../../util')
const { asExpression, Fraction, expressionComparisons, expressionChecks } = require('../../../../../CAS')

const { getSimpleExerciseProcessor, selectRandomVariables, filterVariables, performComparison } = require('../../../../../eduTools')

const { equivalent } = expressionComparisons
const { hasFractionWithinFraction } = expressionChecks

// a/(x+b) * y * z/c = (ayz)/((x+b)c).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'multiplyDivideFractions',
	comparison: (input, correct) => input.isSubtype(Fraction) && !hasFractionWithinFraction(input) && equivalent(input, correct),
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(2, 12),
		b: getRandomInteger(2, 12),
		c: getRandomInteger(2, 12),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression('a/(x+b)*y*z/c').substituteVariables(variables)
	const ans = expression.simplify({ mergeFractionProducts: true })
	return { ...state, variables, expression, ans }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
