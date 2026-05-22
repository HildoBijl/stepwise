const { sample, randomInteger, randomBoolean, count } = require('@step-wise/utils')
const { asExpression } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../eduTools')

// ax(bx+c) = abx^2 + acx.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'expandBrackets',
	steps: [null, 'simplifyNumberProduct', 'rewritePower'],
	comparison: {
		expanded: (input, correct) => !input.hasSumWithinProduct() && correct.equivalent(input),
		numbersMerged: (input, correct) => !input.hasSumWithinProduct() && !input.recursiveSome(term => term.isProduct() && count(term.factors, factor => factor.isNumeric()) > 1) && correct.equivalent(input),
		ans: (input, correct) => correct.equalStructure(input),
	}
}
addSetupFromSteps(metaData)

function generateState() {
	return {
		x: sample(variableSet),
		a: randomInteger(2, 6),
		b: randomInteger(2, 6),
		c: randomInteger(2, 6),
		xFirst: randomBoolean(), // Do we use bx+c or c+bx?
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor = asExpression('a*x').substitute(variables)
	const sum = asExpression(state.xFirst ? 'b*x+c' : 'c+b*x').substitute(variables)
	const expression = factor.multiply(sum)
	const expanded = expression.flatten(['expandProductsOfSums'])
	const numbersMerged = expanded.flatten(['mergeProductNumbers', 'mergeProductMinuses'])
	const ans = numbersMerged.flatten(['mergeProductFactors', 'mergeSumNumbers'])
	return { ...state, variables, factor, sum, expression, expanded, numbersMerged, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'expanded')
		case 2:
			return performComparison(exerciseData, 'numbersMerged')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
