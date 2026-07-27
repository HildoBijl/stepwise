import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/utils'
import { asExpression, expressionComparisons, expressionOperations } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '../../../../../generationTools'

const { onlyOrderChanges } = expressionComparisons
const { multiplyNumeratorAndDenominator } = expressionOperations

// a/(xz) + b/(yz) = (ay+bx)/(xyz).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b']

export default buildStepExercise({
	metaData: {
		skill: 'addFractionsWithMultipleVariables',
		...stepsToSetup([undefined, ['simplifyFractionWithVariables', 'simplifyFractionWithVariables'], 'addLikeFractionsWithVariables']),
		compare: { Expression: onlyOrderChanges },
	},

	generateState() {
		return {
			...selectRandomVariables(sample(availableVariableSets), usedVariables),
			plus: getRandomBoolean(),
			a: getRandomInteger(2, 12),
			b: getRandomInteger(2, 12),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const { plus } = state
		const leftExpression = asExpression('a/(xz)').substitute(variables)
		const rightExpression = asExpression('b/(yz)').substitute(variables)
		const expression = plus ? leftExpression.add(rightExpression) : leftExpression.subtract(rightExpression)
		const denominator = asExpression('xyz').substitute(variables).flatten(['sortProducts'])
		const leftAns = multiplyNumeratorAndDenominator(leftExpression, variables.y).removeTrivial(['mergeProductNumbers', 'sortProducts'])
		const rightAns = multiplyNumeratorAndDenominator(rightExpression, variables.x).removeTrivial(['mergeProductNumbers', 'sortProducts'])
		const ans = (plus ? leftAns.numerator.add(rightAns.numerator) : leftAns.numerator.subtract(rightAns.numerator)).divide(denominator)
		return { ...state, variables, leftExpression, rightExpression, expression, denominator, leftAns, rightAns, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('denominator', data)
			case 2: return compare(['leftAns', 'rightAns'], data)
			default: return compare('ans', data)
		}
	},
})
