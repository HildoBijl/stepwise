import { sample, getRandomInteger, getRandomBoolean, count } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { hasSumWithinProduct } = expressionChecks
const { onlyOrderChanges, equivalent } = expressionComparisons

// (bx+c)*ax^n = bx^(n+1) + cax^n.
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
			a: getRandomInteger(2, 8),
			b: getRandomInteger(2, 8),
			c: getRandomInteger(-8, 8, [0]),
			n: getRandomInteger(1, 3),
			xFirst: getRandomBoolean(),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const factor = asExpression('a*x^n').substitute(variables).removeTrivial()
		const sum = asExpression(state.xFirst ? 'b*x+c' : 'c+b*x').substitute(variables).removeTrivial()
		const expression = sum.multiply(factor).removeTrivial()
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
