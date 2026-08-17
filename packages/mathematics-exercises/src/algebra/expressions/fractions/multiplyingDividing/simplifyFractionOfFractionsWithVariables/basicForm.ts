import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*(x+c)^p)/(b*(x+c)^q/(x+d)^r).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'p', 'q', 'r']

export default buildStepExercise({
	metaData: {
		skill: 'simplifyFractionOfFractionsWithVariables',
		...stepsToSetup(['multiplyDivideFractions', 'simplifyFractionWithVariables']),
		compare: {
			singleFraction: (input: Expression, correct: Expression) => input.isFraction() && !hasFractionWithinFraction(input) && equivalent(input, correct),
			ans: (input: Expression, correct: Expression) => onlyOrderChanges(input.combine(), input.flatten()) && equivalent(input, correct),
		},
	},

	generateState() {
		const factor = getRandomInteger(2, 6)
		const a = factor * getRandomInteger(2, 6)
		const b = factor * getRandomInteger(2, 6, [a / factor])
		const c = getRandomInteger(-4, 4)
		const d = getRandomInteger(-4, 4, [c])
		const p = getRandomInteger(2, 4)
		const q = p + getRandomInteger(1, 3)
		const r = getRandomInteger(2, 4)
		return {
			x: sample(variableSet),
			a, b, c, d, p, q, r,
			flip: getRandomBoolean(),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const baseExpression = asExpression('(a(x+c)^p)/(b(x+c)^q/(x+d)^r)').substitute(variables)
		const expression = (state.flip ? baseExpression.invert() : baseExpression.self()).removeTrivial()
		const singleFraction = expression.flatten(['mergeFractionProducts', 'flattenFractions'])
		const ans = expression.combine()
		return { ...state, variables, expression, singleFraction, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('singleFraction', data)
			default: return compare('ans', data)
		}
	},
})
