import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { asExpression, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '#generationTools'

const { onlyOrderChanges } = expressionComparisons

// ay/x + bz/y = (ay^2 + bxz)/(xy).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b']

export default buildStepExercise({
	metadata: {
		skill: 'addFractionsWithMultipleVariables',
		...createStepExerciseMetadata(['addLikeFractionsWithVariables', ['simplifyFractionWithVariables', 'simplifyFractionWithVariables'], undefined]),
		comparisons: { Expression: onlyOrderChanges },
	},

	generateParameters() {
		return {
			...selectRandomVariables(sample(availableVariableSets), usedVariables),
			plus: randomBoolean(),
			a: randomInteger(2, 12),
			b: randomInteger(2, 12),
		}
	},

	getSolution(parameters) {
		const variables = filterVariables(parameters, usedVariables, constants)
		const sign = parameters.plus ? '+' : '-'
		const expression = asExpression(`(ay^2${sign}bxz)/(xy)`).substitute(variables).removeTrivial(['mergeProductNumbers', 'sortProducts'])
		const leftExpression = asExpression('(ay^2)/(xy)').substitute(variables).removeTrivial(['mergeProductNumbers', 'sortProducts'])
		const rightExpression = asExpression('(bxz)/(xy)').substitute(variables).removeTrivial(['mergeProductNumbers', 'sortProducts'])
		const split = parameters.plus ? leftExpression.add(rightExpression) : leftExpression.subtract(rightExpression)
		const leftAns = leftExpression.normalize()
		const rightAns = rightExpression.normalize()
		const ans = parameters.plus ? leftAns.add(rightAns) : leftAns.subtract(rightAns)
		return { ...parameters, variables, expression, leftExpression, rightExpression, split, leftAns, rightAns, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('split', data)
			case 2: return compareInputs(['leftAns', 'rightAns'], data)
			default: return compareInputs('ans', data)
		}
	},
})
