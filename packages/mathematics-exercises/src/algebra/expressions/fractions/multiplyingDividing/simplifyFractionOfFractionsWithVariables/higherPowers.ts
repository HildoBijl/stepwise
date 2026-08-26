import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons

// ((a*(x+e)^p)/(b*(x+f)^q))/((c*(x+e)^r)/(d*(x+f)^s)).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e', 'f', 'p', 'q', 'r', 's']

export default buildStepExercise({
	metadata: {
		skill: 'simplifyFractionOfFractionsWithVariables',
		...createStepExerciseMetadata(['multiplyDivideFractions', 'simplifyFractionWithVariables']),
		comparisons: {
			singleFraction: (input: Expression, correct: Expression) => input.isFraction() && !hasFractionWithinFraction(input) && equivalent(input, correct),
			ans: (input: Expression, correct: Expression) => onlyOrderChanges(input.combine(), input.flatten()) && equivalent(input, correct),
		},
	},

	generateParameters() {
		const a = randomInteger(-12, 12, { exclude: [-1, 0, 1] })
		const b = randomInteger(-12, 12, { exclude: [-1, 0, 1, a] })
		const c = randomInteger(-12, 12, { exclude: [-1, 0, 1, a, b] })
		const d = randomInteger(-12, 12, { exclude: [-1, 0, 1, a, b, c] })
		const e = randomInteger(-4, 4)
		const f = randomInteger(-4, 4, { exclude: [e] })
		const p = randomInteger(2, 4)
		const q = randomInteger(2, 4, { exclude: [p] })
		const r = p + randomInteger(1, 3)
		const s = q + randomInteger(1, 3)
		return {
			x: sample(variableSet),
			a, b, c, d, e, f, p, q, r, s,
			flip: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = filterVariables(parameters, usedVariables, constants)
		const fraction1 = asExpression('((a*(x+e)^p)/(b*(x+f)^q))', { interpretEAsConstant: false }).substitute(variables).removeTrivial([], ['mergeFractionMinuses'])
		const fraction2 = asExpression('((c*(x+e)^r)/(d*(x+f)^s))', { interpretEAsConstant: false }).substitute(variables).removeTrivial([], ['mergeFractionMinuses'])
		const baseExpression = fraction1.divide(fraction2)
		const expression = (parameters.flip ? baseExpression.invert() : baseExpression.self()).removeTrivial([], ['mergeFractionMinuses'])
		const singleFraction = expression.flatten(['mergeFractionProducts', 'flattenFractions'])
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
