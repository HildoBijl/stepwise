import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/js-utils'
import { asExpression, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '#generationTools'

const { onlyOrderChanges } = expressionComparisons

// 1/(ax) + 1/(by) = (by + ax)/(abxy).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
const constants = ['a', 'b']

export default buildStepExercise({
	metaData: {
		skill: 'addFractionsWithMultipleVariables',
		...stepsToSetup(['addLikeFractionsWithVariables', ['simplifyFractionWithVariables', 'simplifyFractionWithVariables'], undefined]),
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
		const sign = state.plus ? '+' : '-'
		const expression = asExpression(`(by${sign}ax)/(abxy)`).substitute(variables).removeTrivial(['mergeProductNumbers', 'sortProducts'])
		const leftExpression = asExpression('(by)/(abxy)').substitute(variables).removeTrivial(['mergeProductNumbers', 'sortProducts'])
		const rightExpression = asExpression('(ax)/(abxy)').substitute(variables).removeTrivial(['mergeProductNumbers', 'sortProducts'])
		const split = state.plus ? leftExpression.add(rightExpression) : leftExpression.subtract(rightExpression)
		const leftAns = leftExpression.normalize()
		const rightAns = rightExpression.normalize()
		const ans = state.plus ? leftAns.add(rightAns) : leftAns.subtract(rightAns)
		return { ...state, variables, expression, leftExpression, rightExpression, split, leftAns, rightAns, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('split', data)
			case 2: return compare(['leftAns', 'rightAns'], data)
			default: return compare('ans', data)
		}
	},
})
