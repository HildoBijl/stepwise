import { sample, randomInteger, randomBoolean, count } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { hasSumWithinProduct } = expressionChecks
const { onlyOrderChanges, equivalent } = expressionComparisons

// ax(bx^2+cx+d) = abx^3+acx^2+adx.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']

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
			a: randomInteger(2, 8),
			b: randomInteger(-8, 8, [0]),
			c: randomInteger(-8, 8, [0]),
			d: randomInteger(-8, 8, [0]),
			descending: randomBoolean(),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const factor = asExpression('a*x').substitute(variables).removeTrivial()
		const sum = asExpression(state.descending ? 'b*x^2+c*x+d' : 'd+c*x+b*x^2').substitute(variables).removeTrivial()
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
