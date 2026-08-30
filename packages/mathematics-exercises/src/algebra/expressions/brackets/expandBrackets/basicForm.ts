import { sample, randomInteger, randomBoolean, count } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#exerciseBuilding'
import { selectExpressionParameters } from '#generationTools'

const { hasSumWithinProduct } = expressionChecks
const { areEqualExceptOrder, areEquivalent } = expressionComparisons

// ax(bx+c) = abx^2 + acx.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metadata: {
		skill: 'expandBrackets',
		...createStepExerciseMetadata([undefined, 'simplifyNumberProduct', 'rewritePower']),
		comparisons: {
			expanded: (input: Expression, correct: Expression) => !hasSumWithinProduct(input) && areEquivalent(input, correct),
			numbersMerged: (input: Expression, correct: Expression) => !hasSumWithinProduct(input) && !input.some(term => term.isProduct() && count(term.factors, factor => factor.isNumeric()) > 1) && areEquivalent(input, correct),
			ans: areEqualExceptOrder,
		},
	},

	generateParameters() {
		return {
			x: sample(variableSet),
			a: randomInteger(2, 6),
			b: randomInteger(2, 6),
			c: randomInteger(2, 6),
			xFirst: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const factor = asExpression('a*x').substitute(variables).removeTrivial()
		const sum = asExpression(parameters.xFirst ? 'b*x+c' : 'c+b*x').substitute(variables).removeTrivial()
		const expression = factor.multiply(sum).removeTrivial()
		const expanded = expression.flatten(['expandProductsOfSums', 'expandMinusSums'])
		const numbersMerged = expanded.flatten(['combineNumbersInProducts', 'combineMinusSignsInProducts', 'removeDoubleNegatives'])
		const ans = numbersMerged.flatten(['combineLikeFactors', 'combineNumbersInSums'])
		return { ...parameters, variables, factor, sum, expression, expanded, numbersMerged, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('expanded', data)
			case 2: return compareInputs('numbersMerged', data)
			default: return compareInputs('ans', data)
		}
	},
})
