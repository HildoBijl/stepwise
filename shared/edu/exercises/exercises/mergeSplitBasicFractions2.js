const { hasSimpleMatching } = require('../../../util/arrays')
const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { asExpression, Sum, Fraction, expressionChecks } = require('../../../CAS')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performCheck } = require('../util/check')

const { equivalent, hasFractionWithinFraction } = expressionChecks

// x/(az) + y/(az) = (x+y)/(az).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a']

const data = {
	skill: 'mergeSplitBasicFractions',
	check: (input, correct, { toSplit }) => {
		// When the mission is to split, check for a sum with the right length and for the terms to match.
		if (toSplit)
			return input.isType(Sum) && correct.terms.length === input.terms.length && hasSimpleMatching(correct.terms, input.terms, equivalent)
		// When the mission is to merge, check for a correct fraction, and for no fractions inside fractions.
		return input.isType(Fraction) && !hasFractionWithinFraction(input) && equivalent(input, correct)
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
	const together = asExpression(`(x ${plus ? '+' : '-'} y)/(az)`).substituteVariables(variables).removeUseless()
	const split = asExpression(`x/(az) ${plus ? '+' : '-'} y/(az)`).substituteVariables(variables).removeUseless()
	const expression = (toSplit ? together : split)
	const ans = (toSplit ? split : together)
	return { ...state, variables, together, split, expression, ans }
}

function checkInput(state, input) {
	return performCheck('ans', getSolution(state), input, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}