import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { gcd } from '@step-wise/math-tools'
import { and } from '@step-wise/skill-setup'
import { type Expression, asExpression, expressionComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#mathematicsExerciseBuilding'
import { selectExpressionParameters } from '#generationTools'

const { areEquivalent, areEqualExceptOrder } = expressionComparisons

// (a*(x+c)^p*(x+e)*(x+d))/(b*(x+d)^p*(x+c)).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e', 'p', 'q']

export default buildStepExercise({
	metadata: {
		skill: 'simplifyFractionWithVariables',
		...createStepExerciseMetadata(['simplifyFraction', and('rewritePower', 'cancelFractionFactors')]),
		comparisons: {
			numericSimplified: (input: Expression, correct: Expression) => areEqualExceptOrder(input.flatten().flatten(['combineNumbersInProducts', 'combineNumbersInFractions']), input.flatten()) && areEquivalent(input, correct),
			ans: (input: Expression, correct: Expression) => areEqualExceptOrder(input.combine(), input.flatten()) && areEquivalent(input, correct),
		},
	},

	generateParameters() {
		const factor = randomInteger(2, 8)
		const a = factor * randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		const b = factor * randomInteger(-8, 8, { exclude: [-1, 0, 1, a / factor, -a / factor] })
		const c = randomInteger(-4, 4)
		const d = randomInteger(-4, 4, { exclude: [c] })
		const e = randomInteger(-4, 4, { exclude: [c, d] })
		const p = randomInteger(2, 4)
		const q = randomInteger(2, 4)
		return {
			x: sample(variableSet),
			a, b, c, d, e,
			p, q,
			switch: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const baseExpression = asExpression('(a*(x+c)^p*(x+e)*(x+d))/(b*(x+d)^p*(x+c))', { interpretEAsConstant: false }).substitute(variables).removeTrivial()
		const expression = parameters.switch ? baseExpression.invert() : baseExpression.self()
		const factor1 = asExpression('x+c').substitute(variables).removeTrivial()
		const factor2 = asExpression('x+d').substitute(variables).removeTrivial()
		const baseNumericPartOriginal = asExpression('a/b').substitute(variables).removeTrivial()
		const numericPartOriginal = parameters.switch ? baseNumericPartOriginal.invert() : baseNumericPartOriginal.self()
		const numericPart = numericPartOriginal.combine()
		const factor = gcd(parameters.a, parameters.b) * (parameters.a < 0 && parameters.b < 0 ? -1 : 1)
		const numericSimplified = expression.removeTrivial(['combineNumbersInProducts', 'combineNumbersInFractions'])
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
