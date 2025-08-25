const { selectRandomly, getRandomInteger, count, repeat, binomial, arraysToObject } = require('../../../../../../util')
const { repeat: skillRepeat } = require('../../../../../../skillTracking')
const { asExpression, expressionComparisons, expressionChecks, Sum, Product } = require('../../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasProductWithinPowerBase } = expressionChecks

// (a*x^b+c*x^d)^e
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e']

const metaData = {
	skill: 'expandPowerOfSum',
	steps: [skillRepeat('simplifyProductOfPowers', 2), null, 'simplifyNumberProduct'],
	comparison: {
		default: onlyOrderChanges,
	}
}
addSetupFromSteps(metaData)

function generateState(example) {
	const a = getRandomInteger(example ? 2 : -4, 4, [-1, 0, 1])
	const b = getRandomInteger(1, example ? 1 : 2)
	const c = getRandomInteger(example ? 2 : -6, 6, [-1, 0, 1, -a, a])
	const d = getRandomInteger(0, example ? 0 : 1, [b])
	const e = getRandomInteger(example ? 2 : 3, example || Math.max(Math.abs(a), Math.abs(c)) >= 5 ? 4 : 5) // On examples, use powers 2-4. On real exercises, use powers 3-5, but only use 5 on small coefficients.
	return {
		x: selectRandomly(variableSet),
		a, b, c, d, e,
	}
}

function getSolution(state) {
	const { e } = state
	const variables = filterVariables(state, usedVariables, constants)
	const t1 = asExpression('a*x^b').substituteVariables(variables).removeUseless()
	const t2 = asExpression('c*x^d').substituteVariables(variables).removeUseless()
	const expression = t1.add(t2).toPower(e)
	const terms = repeat(e + 1, n => t1.toPower(e - n).multiply(t2.toPower(n)))
	const termsSimplified = terms.map(term => term.advancedClean())
	const coefficients = repeat(e + 1, n => binomial(e, n))
	const sum = new Sum(coefficients.map((c, i) => termsSimplified[i].multiply(c, true)))
	const ans = sum.regularClean()
	const termsNames = repeat(e + 1, i => `term${i}`)
	const coefficientsNames = repeat(e + 1, i => `c${i}`)
	return { ...state, variables, t1, t2, expression, terms, termsSimplified, coefficients, sum, ans, ...arraysToObject(termsNames, termsSimplified), termsNames, ...arraysToObject(coefficientsNames, coefficients), coefficientsNames }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, exerciseData.solution.termsNames)
		case 2:
			return performComparison(exerciseData, exerciseData.solution.coefficientsNames)
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
