const { randomInteger } = require('@step-wise/utils')
const { asExpression, expressionChecks, expressionComparisons } = require('@step-wise/cas')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

// a^(-b) => 1/a^b
const metaData = {
	skill: 'rewriteNegativePower',
	comparison: { ans: (input, correct) => !expressionChecks.hasNegativeExponent(input) && expressionComparisons.equivalent(input, correct) }, // The input has no powers with negative exponents and is equivalent to the model solution.
}

function generateState(example) {
	return {
		a: randomInteger(example ? 2 : -8, 8, [-1, 0, 1]),
		b: randomInteger(2, example ? 5 : 8),
	}
}

function getSolution(state) {
	const expression = asExpression('a^(-b)').substitute(state).removeTrivial()
	const ans = asExpression('1/a^b').substitute(state).removeTrivial()
	const simplified = ans.combine()
	return { ...state, expression, ans, simplified }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, getSolution, checkInput }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
