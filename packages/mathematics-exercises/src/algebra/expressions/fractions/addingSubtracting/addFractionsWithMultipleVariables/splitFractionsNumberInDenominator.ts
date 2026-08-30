import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { asExpression, expressionComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#mathematicsExerciseBuilding'
import { selectRandomVariables, selectExpressionParameters } from '#generationTools'

const { areEqualExceptOrder } = expressionComparisons

// 1/(ax) + 1/(by) = (by + ax)/(abxy).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
const constants = ['a', 'b']

export default buildStepExercise({
	metadata: {
		skill: 'addFractionsWithMultipleVariables',
		...createStepExerciseMetadata(['addLikeFractionsWithVariables', ['simplifyFractionWithVariables', 'simplifyFractionWithVariables'], undefined]),
		comparisons: { Expression: areEqualExceptOrder },
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
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const sign = parameters.plus ? '+' : '-'
		const expression = asExpression(`(by${sign}ax)/(abxy)`).substitute(variables).removeTrivial(['combineNumbersInProducts', 'sortProducts'])
		const leftExpression = asExpression('(by)/(abxy)').substitute(variables).removeTrivial(['combineNumbersInProducts', 'sortProducts'])
		const rightExpression = asExpression('(ax)/(abxy)').substitute(variables).removeTrivial(['combineNumbersInProducts', 'sortProducts'])
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
