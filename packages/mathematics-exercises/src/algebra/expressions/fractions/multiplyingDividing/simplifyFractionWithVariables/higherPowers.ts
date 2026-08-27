import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { gcd } from '@step-wise/math-tools'
import { and } from '@step-wise/skill-setup'
import { type Expression, asExpression, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { areEquivalent, onlyOrderChanges } = expressionComparisons

// (a*(x+c)^p*(x+d)^q)/(b*(x+d)^r*(x+c)^s).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'p', 'q', 'r', 's']

export default buildStepExercise({
	metadata: {
		skill: 'simplifyFractionWithVariables',
		...createStepExerciseMetadata(['simplifyFraction', and('rewritePower', 'cancelFractionFactors')]),
		comparisons: {
			numericSimplified: (input: Expression, correct: Expression) => onlyOrderChanges(input.flatten().flatten(['combineNumbersInProducts', 'combineNumbersInFractions']), input.flatten()) && areEquivalent(input, correct),
			ans: (input: Expression, correct: Expression) => onlyOrderChanges(input.combine(), input.flatten()) && areEquivalent(input, correct),
		},
	},

	generateParameters() {
		const factor = randomInteger(2, 8)
		const a = factor * randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		const b = factor * randomInteger(-8, 8, { exclude: [-1, 0, 1, a / factor, -a / factor] })
		const c = randomInteger(-4, 4)
		const d = randomInteger(-4, 4, { exclude: [c] })
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

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const expression = asExpression(parameters.switch ? '(a*(x+d)^q*(x+c)^p)/(b*(x+c)^s*(x+d)^r)' : '(a*(x+c)^p*(x+d)^q)/(b*(x+d)^r*(x+c)^s)').substitute(variables).removeTrivial()
		const factor1 = asExpression('x+c').substitute(variables).removeTrivial()
		const factor2 = asExpression('x+d').substitute(variables).removeTrivial()
		const numericPartOriginal = asExpression('a/b').substitute(variables).removeTrivial()
		const numericPart = numericPartOriginal.combine()
		const factor = gcd(parameters.a, parameters.b) * (parameters.a < 0 && parameters.b < 0 ? -1 : 1)
		const numericSimplified = expression.flatten(['combineNumbersInProducts', 'combineNumbersInFractions'])
		const ans = expression.combine()
		return { ...parameters, variables, expression, factor1, factor2, numericPartOriginal, numericPart, factor, numericSimplified, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('numericSimplified', data)
			default: return compareInputs('ans', data)
		}
	},
})
