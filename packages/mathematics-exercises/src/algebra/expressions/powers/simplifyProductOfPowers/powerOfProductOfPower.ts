import { sample, randomInteger, count } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionComparisons, expressionChecks } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { areEquivalent, onlyOrderChanges } = expressionComparisons
const { hasProductWithinPowerBase } = expressionChecks

// (ax^b)^c = a^c*x^(bc).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c']

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
		const a = randomInteger(example ? 2 : -8, 8, { exclude: [-1, 0, 1] })
		return {
			x: sample(variableSet),
			a,
			b: randomInteger(2, 6),
			c: randomInteger(2, Math.abs(a) >= 6 ? 3 : 4),
		}
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const expression = asExpression('(a*x^b)^c').substitute(variables).removeTrivial()
		const bracketsExpanded = expression.removeTrivial(['expandPowersOfProducts', 'combineMinusSignsInPowers'])
		const numbersSimplified = bracketsExpanded.removeTrivial(['combineNumbersInProducts', 'evaluateNumericPowers'])
		const powersMerged = numbersSimplified.removeTrivial(['flattenNestedPowers'])
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
