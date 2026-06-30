const { getRandomInteger } = require('@step-wise/utils')
const { asExpression, expressionChecks, expressionComparisons } = require('@step-wise/cas')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

// 1/a^b => a^(-b)
const metaData = {
	skill: 'rewriteNegativePower',
	comparison: { ans: (input, correct) => !expressionChecks.hasFraction(input) && expressionComparisons.equivalent(input, correct) }, // The input has no powers with negative exponents and is equivalent to the model solution.
}

function generateState(example) {
	return {
		a: getRandomInteger(example ? 2 : -8, 8, [-1, 0, 1]),
		b: getRandomInteger(2, example ? 5 : 8),
	}
}

function getSolution(state) {
	const expression = asExpression('1/a^b').substitute(state).removeTrivial()
	const ans = asExpression('a^(-b)').substitute(state).removeTrivial()
	const simplified = ans.combine()
	return { ...state, expression, ans, simplified }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
