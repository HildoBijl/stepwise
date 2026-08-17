import { sample, getRandomInteger, getRandomBoolean, count } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { hasSumWithinProduct } = expressionChecks
const { onlyOrderChanges, equivalent } = expressionComparisons

// With a negative: ax(b-cx^n) = abx-acx^(n+1).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'n']

export default buildStepExercise({
	metaData: {
		skill: 'expandBrackets',
		...stepsToSetup([undefined, 'simplifyNumberProduct', 'rewritePower']),
		compare: {
			expanded: (input: Expression, correct: Expression) => !hasSumWithinProduct(input) && equivalent(input, correct),
			numbersMerged: (input: Expression, correct: Expression) => !hasSumWithinProduct(input) && !input.some(term => term.isProduct() && count(term.factors, factor => factor.isNumeric()) > 1) && equivalent(input, correct),
			ans: onlyOrderChanges,
		},
	},

	generateState() {
		return {
			x: sample(variableSet),
			a: getRandomInteger(-8, -2),
			b: getRandomInteger(2, 8),
			c: getRandomInteger(2, 8),
			n: getRandomInteger(1, 3),
			xFirst: getRandomBoolean(),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const factor = asExpression('ax').substitute(variables).removeTrivial()
		const sum = asExpression(state.xFirst ? 'b-c*x^n' : 'c*x^n-b').substitute(variables).removeTrivial()
		const expression = factor.multiply(sum).removeTrivial()
		const expanded = expression.flatten(['expandProductsOfSums', 'expandMinusSums'])
		const numbersMerged = expanded.flatten(['mergeProductNumbers', 'mergeProductMinuses', 'removeDoubleNegatives'])
		const ans = numbersMerged.flatten(['mergeProductFactors', 'mergeSumNumbers'])
		return { ...state, variables, factor, sum, expression, expanded, numbersMerged, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('expanded', data)
			case 2: return compare('numbersMerged', data)
			default: return compare('ans', data)
		}
	},
})
