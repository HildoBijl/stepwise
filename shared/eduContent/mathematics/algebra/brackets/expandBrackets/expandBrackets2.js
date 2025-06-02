const { selectRandomly, getRandomInteger } = require('../../../../../util')
const { asExpression, expressionComparisons, expressionChecks } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../eduTools')

const { equivalent } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// (x+a)(y+b) = xy + ay + xb + ab.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b']

const metaData = {
	steps: ['expandBrackets', 'expandBrackets'],
	comparison: (input, correct) => !hasSumWithinProduct(input) && equivalent(input, correct),
}
addSetupFromSteps(metaData)

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(-6, 6, [0]),
		b: getRandomInteger(-6, 6, [0]),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression('(x+a)(y+b)').substituteVariables(variables)
	const term1 = expression.terms[0]
	const term2 = expression.terms[1]
	const expressionSubstituted = asExpression('z(y+b)').substituteVariables(variables)
	const intermediate = expressionSubstituted.regularClean({ expandProductsOfSums: true })
	const intermediateSubstituted = intermediate.substitute(variables.z, term1)
	const ans = intermediateSubstituted.cleanForAnalysis()
	return { ...state, variables, expression, term1, term2, expressionSubstituted, intermediate, intermediateSubstituted, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'intermediate')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
