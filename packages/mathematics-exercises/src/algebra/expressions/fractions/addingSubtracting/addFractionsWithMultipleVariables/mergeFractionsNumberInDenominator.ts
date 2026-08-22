import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { lcm } from '@step-wise/math-tools'
import { asExpression, expressionComparisons, expressionOperations } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '#generationTools'

const { onlyOrderChanges } = expressionComparisons
const { multiplyNumeratorAndDenominator } = expressionOperations

// 1/(ax) + 1/(by) = (by + ax)/(abxy).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
const constants = ['a', 'b']

export default buildStepExercise({
	metaData: {
		skill: 'addFractionsWithMultipleVariables',
		...createStepExerciseMetadata([undefined, ['simplifyFractionWithVariables', 'simplifyFractionWithVariables'], 'addLikeFractionsWithVariables']),
		compare: { Expression: onlyOrderChanges },
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
		const { plus, a, b } = parameters
		const leftExpression = asExpression('1/(ax)').substitute(variables)
		const rightExpression = asExpression('1/(by)').substitute(variables)
		const expression = plus ? leftExpression.add(rightExpression) : leftExpression.subtract(rightExpression)
		const lcmValue = lcm(a, b)
		const denominator = asExpression(`${lcmValue}xy`).substitute(variables).flatten(['sortProducts'])
		const leftAns = multiplyNumeratorAndDenominator(multiplyNumeratorAndDenominator(leftExpression, lcmValue / a), variables.y).removeTrivial(['mergeProductNumbers', 'sortProducts'])
		const rightAns = multiplyNumeratorAndDenominator(multiplyNumeratorAndDenominator(rightExpression, lcmValue / b), variables.x).removeTrivial(['mergeProductNumbers', 'sortProducts'])
		const ans = (plus ? leftAns.numerator.add(rightAns.numerator) : leftAns.numerator.subtract(rightAns.numerator)).divide(denominator)
		return { ...parameters, variables, leftExpression, rightExpression, expression, lcmValue, denominator, leftAns, rightAns, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('denominator', data)
			case 2: return compare(['leftAns', 'rightAns'], data)
			default: return compare('ans', data)
		}
	},
})
