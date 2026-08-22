import { randomInteger } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

// 1/a^b => a^(-b)
export default buildMonoExercise({
	metaData: {
		skill: 'rewriteNegativePower',
		compare: { ans: (input: Expression, correct: Expression) => !expressionChecks.hasFraction(input) && expressionComparisons.equivalent(input, correct) },
	},

	generateParameters(example) {
		return {
			a: randomInteger(example ? 2 : -8, 8, { exclude: [-1, 0, 1] }),
			b: randomInteger(2, example ? 5 : 8),
		}
	},

	getSolution(parameters) {
		const expression = asExpression('1/a^b').substitute(parameters).removeTrivial()
		const ans = asExpression('a^(-b)').substitute(parameters).removeTrivial()
		const simplified = ans.combine()
		return { ...parameters, expression, ans, simplified }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
