import { sample, randomInteger, count } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionComparisons, expressionChecks } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { areEquivalent, onlyOrderChanges } = expressionComparisons
const { hasProductWithinPowerBase } = expressionChecks

// ax^b*(cx)^d = ac^d*x^(b+d).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']

export default buildStepExercise({
	metadata: {
		skill: 'simplifyProductOfPowers',
		...createStepExerciseMetadata(['rewritePower', 'simplifyNumberProduct', 'rewritePower']),
		comparisons: {
			bracketsExpanded: (input: Expression, correct: Expression) => !hasProductWithinPowerBase(input) && areEquivalent(input, correct),
			numbersSimplified: (input: Expression, correct: Expression) => !hasProductWithinPowerBase(input) && !input.some(term => term.isProduct() && count(term.factors, factor => factor.isNumeric()) > 1) && areEquivalent(input, correct),
			ans: onlyOrderChanges,
		},
	},

	generateParameters(example) {
		const c = randomInteger(example ? 2 : -6, 6, { exclude: [-1, 0, 1] })
		return {
			x: sample(variableSet),
			a: randomInteger(example ? 2 : -8, 8, { exclude: [-1, 0, 1] }),
			b: randomInteger(2, 6),
			c,
			d: randomInteger(2, Math.abs(c) >= 5 ? 3 : 4),
		}
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const expression = asExpression('a*x^b*(c*x)^d').substitute(variables).removeTrivial()
		const bracketsExpanded = expression.removeTrivial(['expandPowersOfProducts', 'mergePowerMinuses'])
		const numbersSimplified = bracketsExpanded.removeTrivial(['mergeProductNumbers', 'reduceNumberPowers'])
		const powersMerged = numbersSimplified.removeTrivial(['mergeProductFactors'])
		const ans = powersMerged.combine()
		return { ...parameters, variables, expression, bracketsExpanded, numbersSimplified, powersMerged, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('bracketsExpanded', data)
			case 2: return compareInputs('numbersSimplified', data)
			default: return compareInputs('ans', data)
		}
	},
})
