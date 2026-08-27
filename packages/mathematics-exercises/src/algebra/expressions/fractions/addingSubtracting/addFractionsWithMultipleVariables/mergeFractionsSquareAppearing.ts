import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { asExpression, expressionComparisons, expressionOperations } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectRandomVariables, selectExpressionParameters } from '#generationTools'

const { onlyOrderChanges } = expressionComparisons
const { multiplyNumeratorAndDenominator } = expressionOperations

// ay/x + bz/y = (ay^2 + bxz)/(xy).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b']

export default buildStepExercise({
	metadata: {
		skill: 'addFractionsWithMultipleVariables',
		...createStepExerciseMetadata([undefined, ['simplifyFractionWithVariables', 'simplifyFractionWithVariables'], 'addLikeFractionsWithVariables']),
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
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const { plus } = parameters
		const leftExpression = asExpression('(ay)/x').substitute(variables)
		const rightExpression = asExpression('(bz)/y').substitute(variables)
		const expression = plus ? leftExpression.add(rightExpression) : leftExpression.subtract(rightExpression)
		const denominator = asExpression('xy').substitute(variables).flatten(['sortProducts'])
		const leftAns = multiplyNumeratorAndDenominator(leftExpression, variables.y).removeTrivial(['combineNumbersInProducts', 'combineLikeFactors', 'combineNumbersInSums', 'sortProducts'])
		const rightAns = multiplyNumeratorAndDenominator(rightExpression, variables.x).removeTrivial(['combineNumbersInProducts', 'combineLikeFactors', 'combineNumbersInSums', 'sortProducts'])
		const ans = (plus ? leftAns.numerator.add(rightAns.numerator) : leftAns.numerator.subtract(rightAns.numerator)).divide(denominator)
		return { ...parameters, variables, leftExpression, rightExpression, expression, denominator, leftAns, rightAns, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('denominator', data)
			case 2: return compareInputs(['leftAns', 'rightAns'], data)
			default: return compareInputs('ans', data)
		}
	},
})
