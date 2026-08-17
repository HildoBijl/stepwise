import { sample, getRandomInteger, count } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionComparisons, expressionChecks } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasProductWithinPowerBase } = expressionChecks

// ax^b*(cx)^d = ac^d*x^(b+d).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']

export default buildStepExercise({
	metaData: {
		skill: 'simplifyProductOfPowers',
		...stepsToSetup(['rewritePower', 'simplifyNumberProduct', 'rewritePower']),
		compare: {
			bracketsExpanded: (input: Expression, correct: Expression) => !hasProductWithinPowerBase(input) && equivalent(input, correct),
			numbersSimplified: (input: Expression, correct: Expression) => !hasProductWithinPowerBase(input) && !input.some(term => term.isProduct() && count(term.factors, factor => factor.isNumeric()) > 1) && equivalent(input, correct),
			ans: onlyOrderChanges,
		},
	},

	generateState(example) {
		const c = getRandomInteger(example ? 2 : -6, 6, [-1, 0, 1])
		return {
			x: sample(variableSet),
			a: getRandomInteger(example ? 2 : -8, 8, [-1, 0, 1]),
			b: getRandomInteger(2, 6),
			c,
			d: getRandomInteger(2, Math.abs(c) >= 5 ? 3 : 4),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const expression = asExpression('a*x^b*(c*x)^d').substitute(variables).removeTrivial()
		const bracketsExpanded = expression.removeTrivial(['expandPowersOfProducts', 'mergePowerMinuses'])
		const numbersSimplified = bracketsExpanded.removeTrivial(['mergeProductNumbers', 'reduceNumberPowers'])
		const powersMerged = numbersSimplified.removeTrivial(['mergeProductFactors'])
		const ans = powersMerged.combine()
		return { ...state, variables, expression, bracketsExpanded, numbersSimplified, powersMerged, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('bracketsExpanded', data)
			case 2: return compare('numbersSimplified', data)
			default: return compare('ans', data)
		}
	},
})
