const { selectRandomly, getRandomInteger } = require('../../../util/random')
const { asExpression, simplifyOptions, expressionChecks } = require('../../../CAS')
const { combinerRepeat } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performCheck } = require('../util/check')

const { hasSumWithinProduct, equivalent } = expressionChecks

// (x+a)(y+b) = xy + ay + xb + ab.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b']

const data = {
	setup: combinerRepeat('expandBrackets', 2),
	steps: ['expandBrackets', 'expandBrackets'],
	check: {
		default: (correct, input) => !hasSumWithinProduct(input) && equivalent(correct, input),
	},
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(-6, 6, [0]),
		b: getRandomInteger(-6, 6, [0]),
	}
}

function getCorrect(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression('(x+a)(y+b)').substituteVariables(variables)
	const term1 = expression.terms[0]
	const term2 = expression.terms[1]
	const expressionSubstituted = asExpression('z(y+b)').substituteVariables(variables)
	const intermediate = expressionSubstituted.simplify(simplifyOptions.forAnalysis)
	const intermediateSubstituted = intermediate.substitute(variables.z, term1)
	const ans = intermediateSubstituted.simplify(simplifyOptions.forAnalysis)
	return { ...state, variables, expression, term1, term2, expressionSubstituted, intermediate, intermediateSubstituted, ans }
}

function checkInput(state, input, step) {
	const correct = getCorrect(state)
	if (step === 0 || step === 3)
		return performCheck('ans', correct, input, data.check)
	if (step === 1)
		return performCheck('intermediate', correct, input, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getCorrect,
	checkInput,
}