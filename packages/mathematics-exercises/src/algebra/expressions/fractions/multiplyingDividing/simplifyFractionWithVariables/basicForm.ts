import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { and } from '@step-wise/skill-setup'
import { type Expression, asExpression, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*x^c)/(b*x^d*(x+f)).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'f']

export default buildStepExercise({
	metaData: {
		skill: 'simplifyFractionWithVariables',
		...stepsToSetup(['simplifyFraction', and('rewritePower', 'cancelFractionFactors')]),
		compare: {
			numericSimplified: (input: Expression, correct: Expression) => onlyOrderChanges(input.flatten().simplify(['mergeProductNumbers', 'mergeFractionNumbers']), input.flatten()) && equivalent(input, correct),
			ans: (input: Expression, correct: Expression) => onlyOrderChanges(input.combine(), input.flatten()) && equivalent(input, correct),
		},
	},

	generateState() {
		const b = randomInteger(2, 6)
		const a = b * randomInteger(2, 6)
		const d = randomInteger(1, 3)
		const c = d + randomInteger(1, 3)
		return {
			x: sample(variableSet),
			a, b, c, d,
			f: randomInteger(-6, 6, [0]),
			switch: randomBoolean(),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const baseExpression = asExpression('(a*x^c)/(b*x^d*(x+f))').substitute(variables).removeTrivial()
		const expression = state.switch ? baseExpression.invert() : baseExpression.self()
		const baseNumericPartOriginal = asExpression('a/b').substitute(variables).removeTrivial()
		const numericPartOriginal = state.switch ? baseNumericPartOriginal.invert() : baseNumericPartOriginal.self()
		const numericPart = numericPartOriginal.combine()
		const numericSimplified = expression.removeTrivial(['mergeProductNumbers', 'mergeFractionNumbers'])
		const ans = expression.combine()
		return { ...state, variables, expression, numericPartOriginal, numericPart, numericSimplified, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('numericSimplified', data)
			default: return compare('ans', data)
		}
	},
})
