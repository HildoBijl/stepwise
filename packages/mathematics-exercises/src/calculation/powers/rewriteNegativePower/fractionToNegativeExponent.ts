import { randomInteger } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildMonoExercise } from '#mathematicsExerciseBuilding'

// 1/a^b => a^(-b)
export default buildMonoExercise({
	metadata: {
		skill: 'rewriteNegativePower',
		comparisons: { ans: (input: Expression, correct: Expression) => !expressionChecks.hasFraction(input) && expressionComparisons.areEquivalent(input, correct) },
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
		return compareInputs('ans', data)
	},
})
