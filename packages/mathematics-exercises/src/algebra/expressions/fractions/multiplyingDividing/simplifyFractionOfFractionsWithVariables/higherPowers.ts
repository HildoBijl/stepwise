import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons

// ((a*(x+e)^p)/(b*(x+f)^q))/((c*(x+e)^r)/(d*(x+f)^s)).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e', 'f', 'p', 'q', 'r', 's']

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
		const a = getRandomInteger(-12, 12, [-1, 0, 1])
		const b = getRandomInteger(-12, 12, [-1, 0, 1, a])
		const c = getRandomInteger(-12, 12, [-1, 0, 1, a, b])
		const d = getRandomInteger(-12, 12, [-1, 0, 1, a, b, c])
		const e = getRandomInteger(-4, 4)
		const f = getRandomInteger(-4, 4, [e])
		const p = getRandomInteger(2, 4)
		const q = getRandomInteger(2, 4, [p])
		const r = p + getRandomInteger(1, 3)
		const s = q + getRandomInteger(1, 3)
		return {
			x: sample(variableSet),
			a, b, c, d, e, f, p, q, r, s,
			flip: getRandomBoolean(),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const fraction1 = asExpression('((a*(x+e)^p)/(b*(x+f)^q))', { eAsConstant: false }).substitute(variables).removeTrivial([], ['mergeFractionMinuses'])
		const fraction2 = asExpression('((c*(x+e)^r)/(d*(x+f)^s))', { eAsConstant: false }).substitute(variables).removeTrivial([], ['mergeFractionMinuses'])
		const baseExpression = fraction1.divide(fraction2)
		const expression = (state.flip ? baseExpression.invert() : baseExpression.self()).removeTrivial([], ['mergeFractionMinuses'])
		const singleFraction = expression.flatten(['mergeFractionProducts', 'flattenFractions'])
		const inBetween = singleFraction.cancel()
		const ans = expression.combine()
		return { ...state, variables, fraction1, fraction2, expression, singleFraction, inBetween, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('singleFraction', data)
			default: return compare('ans', data)
		}
	},
})
