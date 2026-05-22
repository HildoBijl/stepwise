const { sample, randomInteger, randomBoolean, count } = require('@step-wise/utils')
const { asExpression } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../eduTools')

// (bx+c)*ax^n = bx^(n+1) + cax^n.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'n']

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
		a: randomInteger(2, 8),
		b: randomInteger(2, 8),
		c: randomInteger(-8, 8, [0]),
		n: randomInteger(1, 3),
		xFirst: randomBoolean(), // Do we use bx+c or c+bx?
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor = asExpression('a*x^n').substitute(variables).removeUseless()
	const sum = asExpression(state.xFirst ? 'b*x+c' : 'c+b*x').substitute(variables)
	const expression = sum.multiply(factor).removeUseless()
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
