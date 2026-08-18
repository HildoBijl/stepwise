import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { gcd } from '@step-wise/math-tools'
import { and } from '@step-wise/skill-setup'
import { type Expression, asExpression, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*(x+c)^p*(x+d)^q)/(b*(x+d)^r*(x+c)^s).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'p', 'q', 'r', 's']

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
		const factor = randomInteger(2, 8)
		const a = factor * randomInteger(-8, 8, [-1, 0, 1])
		const b = factor * randomInteger(-8, 8, [-1, 0, 1, a / factor, -a / factor])
		const c = randomInteger(-4, 4)
		const d = randomInteger(-4, 4, [c])
		const p = randomInteger(2, 4)
		const r = randomInteger(2, 4)
		const q = r + randomInteger(1, 3)
		const s = p + randomInteger(1, 3)
		return {
			x: sample(variableSet),
			a, b, c, d,
			p, q, r, s,
			switch: randomBoolean(),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const expression = asExpression(state.switch ? '(a*(x+d)^q*(x+c)^p)/(b*(x+c)^s*(x+d)^r)' : '(a*(x+c)^p*(x+d)^q)/(b*(x+d)^r*(x+c)^s)').substitute(variables).removeTrivial()
		const factor1 = asExpression('x+c').substitute(variables).removeTrivial()
		const factor2 = asExpression('x+d').substitute(variables).removeTrivial()
		const numericPartOriginal = asExpression('a/b').substitute(variables).removeTrivial()
		const numericPart = numericPartOriginal.combine()
		const factor = gcd(state.a, state.b) * (state.a < 0 && state.b < 0 ? -1 : 1)
		const numericSimplified = expression.flatten(['mergeProductNumbers', 'mergeFractionNumbers'])
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
