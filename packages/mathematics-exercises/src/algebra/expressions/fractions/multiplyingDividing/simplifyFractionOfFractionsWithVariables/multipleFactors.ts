import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#mathematicsExerciseBuilding'
import { selectExpressionParameters } from '#generationTools'

const { hasFractionWithinFraction } = expressionChecks
const { areEquivalent, areEqualExceptOrder } = expressionComparisons

// ((a*(x+p)*(x+q))/(b*(x+r)*(x+s)))/((c*(x+q)*(x+s))/(d*(x+p)*(x+r))).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'p', 'q', 'r', 's']

export default buildStepExercise({
	metadata: {
		skill: 'simplifyFractionOfFractionsWithVariables',
		...createStepExerciseMetadata(['multiplyDivideFractions', 'simplifyFractionWithVariables']),
		comparisons: {
			singleFraction: (input: Expression, correct: Expression) => input.isFraction() && !hasFractionWithinFraction(input) && areEquivalent(input, correct),
			ans: (input: Expression, correct: Expression) => areEqualExceptOrder(input.combine(), input.flatten()) && areEquivalent(input, correct),
		},
	},

	generateParameters() {
		const a = randomInteger(-12, 12, { exclude: [-1, 0, 1] })
		const b = randomInteger(-12, 12, { exclude: [-1, 0, 1, a] })
		const c = randomInteger(-12, 12, { exclude: [-1, 0, 1, a, b] })
		const d = randomInteger(-12, 12, { exclude: [-1, 0, 1, a, b, c] })
		const p = randomInteger(-4, 4)
		const q = randomInteger(-4, 4, { exclude: [p] })
		const r = randomInteger(-4, 4, { exclude: [p, q] })
		const s = randomInteger(-4, 4, { exclude: [p, q, r] })
		return {
			x: sample(variableSet),
			a, b, c, d, p, q, r, s,
			flip: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const fraction1 = asExpression('((a(x+p)(x+q))/(b(x+r)(x+s)))').substitute(variables).removeTrivial([], ['combineMinusSignsInFractions'])
		const fraction2 = asExpression('((c(x+q)(x+s))/(d(x+p)(x+r)))').substitute(variables).removeTrivial([], ['combineMinusSignsInFractions'])
		const baseExpression = fraction1.divide(fraction2)
		const expression = (parameters.flip ? baseExpression.invert() : baseExpression.self()).removeTrivial([], ['combineMinusSignsInFractions'])
		const singleFraction = expression.flatten(['combineProductFractions', 'flattenFractions'])
		const inBetween = singleFraction.cancel()
		const ans = expression.combine()
		return { ...parameters, variables, fraction1, fraction2, expression, singleFraction, inBetween, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('singleFraction', data)
			default: return compareInputs('ans', data)
		}
	},
})
