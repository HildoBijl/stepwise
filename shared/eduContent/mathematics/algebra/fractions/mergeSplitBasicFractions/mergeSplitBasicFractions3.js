const { hasSimpleMatching, selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../util')
const { asExpression, Sum, Fraction, expressionComparisons, expressionChecks } = require('../../../../../CAS')

const { getSimpleExerciseProcessor, selectRandomVariables, filterVariables, performComparison } = require('../../../../../eduTools')

const { equivalent } = expressionComparisons
const { hasFractionWithinFraction } = expressionChecks

// x/(z+a) + y/(z+a) = (x+y)/(z+a).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a']

const metaData = {
	skill: 'mergeSplitBasicFractions',
	comparison: (input, correct, { toSplit }) => {
		// When the mission is to split, check for a sum with the right length and for the terms to match.
		if (toSplit)
			return input.isSubtype(Sum) && correct.terms.length === input.terms.length && hasSimpleMatching(correct.terms, input.terms, equivalent)
		// When the mission is to merge, check for a correct fraction, and for no fractions inside fractions.
		return input.isSubtype(Fraction) && !hasFractionWithinFraction(input) && equivalent(input, correct)
	},
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		toSplit: getRandomBoolean(), // Is the question to split the fraction? Or to merge it?
		plus: getRandomBoolean(), // Is there a plus or a minus sign?
		a: getRandomInteger(2, 12),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const { toSplit, plus } = state

	// Set up expressions to return.
	const together = asExpression(`(x ${plus ? '+' : '-'} y)/(z+a)`).substituteVariables(variables).removeUseless()
	const split = asExpression(`x/(z+a) ${plus ? '+' : '-'} y/(z+a)`).substituteVariables(variables).removeUseless()
	const expression = (toSplit ? together : split)
	const ans = (toSplit ? split : together)
	return { ...state, variables, together, split, expression, ans }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
