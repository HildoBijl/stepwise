import { getRandomInteger } from '@step-wise/utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

// a^(-b) => 1/a^b
export default buildSimpleExercise({
	metaData: {
		skill: 'rewriteNegativePower',
		compare: { ans: (input: Expression, correct: Expression) => !expressionChecks.hasNegativeExponent(input) && expressionComparisons.equivalent(input, correct) },
	},

	generateState(example) {
		return {
			a: getRandomInteger(example ? 2 : -8, 8, [-1, 0, 1]),
			b: getRandomInteger(2, example ? 5 : 8),
		}
	},

	getSolution(state) {
		const expression = asExpression('a^(-b)').substitute(state).removeTrivial()
		const ans = asExpression('1/a^b').substitute(state).removeTrivial()
		const simplified = ans.combine()
		return { ...state, expression, ans, simplified }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
