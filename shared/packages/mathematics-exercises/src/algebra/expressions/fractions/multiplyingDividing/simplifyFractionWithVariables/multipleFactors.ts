import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/utils'
import { gcd } from '@step-wise/math-tools'
import { and } from '@step-wise/skill-setup'
import { type Expression, asExpression, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '../../../../../generationTools'

const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*(x+c)^p*(x+e)*(x+d))/(b*(x+d)^p*(x+c)).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e', 'p', 'q']

export default buildStepExercise({
	metaData: {
		skill: 'simplifyFractionWithVariables',
		...stepsToSetup(['simplifyFraction', and('rewritePower', 'cancelFractionFactors')]),
		compare: {
			numericSimplified: (input: Expression, correct: Expression) => onlyOrderChanges(input.flatten().flatten(['mergeProductNumbers', 'mergeFractionNumbers']), input.flatten()) && equivalent(input, correct),
			ans: (input: Expression, correct: Expression) => onlyOrderChanges(input.combine(), input.flatten()) && equivalent(input, correct),
		},
	},

	generateState() {
		const factor = getRandomInteger(2, 8)
		const a = factor * getRandomInteger(-8, 8, [-1, 0, 1])
		const b = factor * getRandomInteger(-8, 8, [-1, 0, 1, a / factor, -a / factor])
		const c = getRandomInteger(-4, 4)
		const d = getRandomInteger(-4, 4, [c])
		const e = getRandomInteger(-4, 4, [c, d])
		const p = getRandomInteger(2, 4)
		const q = getRandomInteger(2, 4)
		return {
			x: sample(variableSet),
			a, b, c, d, e,
			p, q,
			switch: getRandomBoolean(),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const baseExpression = asExpression('(a*(x+c)^p*(x+e)*(x+d))/(b*(x+d)^p*(x+c))', { eAsConstant: false }).substitute(variables).removeTrivial()
		const expression = state.switch ? baseExpression.invert() : baseExpression.self()
		const factor1 = asExpression('x+c').substitute(variables).removeTrivial()
		const factor2 = asExpression('x+d').substitute(variables).removeTrivial()
		const baseNumericPartOriginal = asExpression('a/b').substitute(variables).removeTrivial()
		const numericPartOriginal = state.switch ? baseNumericPartOriginal.invert() : baseNumericPartOriginal.self()
		const numericPart = numericPartOriginal.combine()
		const factor = gcd(state.a, state.b) * (state.a < 0 && state.b < 0 ? -1 : 1)
		const numericSimplified = expression.removeTrivial(['mergeProductNumbers', 'mergeFractionNumbers'])
		const ans = expression.combine()
		return { ...state, variables, expression, factor1, factor2, numericPartOriginal, numericPart, factor, numericSimplified, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('numericSimplified', data)
			default: return compare('ans', data)
		}
	},
})
