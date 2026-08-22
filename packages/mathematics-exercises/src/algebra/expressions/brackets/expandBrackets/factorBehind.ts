import { sample, randomInteger, randomBoolean, count } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
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
		...createStepExerciseMetadata([undefined, 'simplifyNumberProduct', 'rewritePower']),
		compare: {
			expanded: (input: Expression, correct: Expression) => !hasSumWithinProduct(input) && equivalent(input, correct),
			numbersMerged: (input: Expression, correct: Expression) => !hasSumWithinProduct(input) && !input.some(term => term.isProduct() && count(term.factors, factor => factor.isNumeric()) > 1) && equivalent(input, correct),
			ans: onlyOrderChanges,
		},
	},

	generateParameters() {
		return {
			x: sample(variableSet),
			a: randomInteger(2, 8),
			b: randomInteger(2, 8),
			c: randomInteger(-8, 8, { exclude: [0] }),
			n: randomInteger(1, 3),
			xFirst: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = filterVariables(parameters, usedVariables, constants)
		const factor = asExpression('a*x^n').substitute(variables).removeTrivial()
		const sum = asExpression(parameters.xFirst ? 'b*x+c' : 'c+b*x').substitute(variables).removeTrivial()
		const expression = sum.multiply(factor).removeTrivial()
		const expanded = expression.flatten(['expandProductsOfSums', 'expandMinusSums'])
		const numbersMerged = expanded.flatten(['mergeProductNumbers', 'mergeProductMinuses', 'removeDoubleNegatives'])
		const ans = numbersMerged.flatten(['mergeProductFactors', 'mergeSumNumbers'])
		return { ...parameters, variables, factor, sum, expression, expanded, numbersMerged, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('expanded', data)
			case 2: return compare('numbersMerged', data)
			default: return compare('ans', data)
		}
	},
})
