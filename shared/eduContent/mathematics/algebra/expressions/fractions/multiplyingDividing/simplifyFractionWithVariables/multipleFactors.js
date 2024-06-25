const { selectRandomly, getRandomInteger, getRandomBoolean, gcd } = require('../../../../../../../util')
const { asExpression, expressionComparisons } = require('../../../../../../../CAS')
const { and } = require('../../../../../../../skillTracking')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*(x+c)^p*(x+e)*(x+d))/(b*(x+d)^p*(x+c)).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e', 'f', 'p', 'q']

const metaData = {
	skill: 'simplifyFractionWithVariables',
	steps: ['simplifyFraction', and('rewritePowers', 'cancelFractionFactors')],
	comparison: {
		// Input is equivalent and cannot be simplified further.
		numericSimplified: (input, correct) => onlyOrderChanges(input.elementaryClean().simplify({ mergeProductNumbers: true, crossOutFractionNumbers: true }), input.elementaryClean()) && equivalent(input, correct),
		ans: (input, correct) => onlyOrderChanges(input.regularClean(), input.elementaryClean()) && equivalent(input, correct),
	}
}

function generateState() {
	const factor = getRandomInteger(2, 8)
	const a = factor * getRandomInteger(-8, 8, [-1, 0, 1])
	const b = factor * getRandomInteger(-8, 8, [-1, 0, 1, a / factor, -a / factor])
	const c = getRandomInteger(-3, 3)
	const d = getRandomInteger(-3, 3, [c])
	const e = getRandomInteger(-3, 3, [c, d])
	const p = getRandomInteger(2, 4)
	const q = getRandomInteger(2, 4)
	return {
		x: selectRandomly(variableSet),
		a, b, c, d, e,
		p, q,
		switch: getRandomBoolean(), // Put the highest power at the front or the back?
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	let expression = asExpression('(a*(x+c)^p*(x+e)*(x+d))/(b*(x+d)^p*(x+c))').substituteVariables(variables).removeUseless()[state.switch ? 'invert' : 'self']()
	const factor1 = asExpression('x+c').substituteVariables(variables).removeUseless()
	const factor2 = asExpression('x+d').substituteVariables(variables).removeUseless()

	// Set up the numeric parts for display purposes.
	const numericPartOriginal = asExpression('a/b').substituteVariables(variables).removeUseless()[state.switch ? 'invert' : 'self']()
	const numericPart = numericPartOriginal.regularClean()
	const factor = gcd(state.a, state.b) * (state.a < 0 && state.b < 0 ? -1 : 1)

	// Apply cleaning.
	const numericSimplified = expression.simplify({ mergeProductNumbers: true, crossOutFractionNumbers: true })
	const ans = expression.regularClean()
	return { ...state, variables, expression, factor1, factor2, numericPartOriginal, numericPart, factor, numericSimplified, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'numericSimplified')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
