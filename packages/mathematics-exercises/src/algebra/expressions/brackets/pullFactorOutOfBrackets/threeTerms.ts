import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#mathematicsExerciseBuilding'
import { selectExpressionParameters } from '#generationTools'

const { areEqualExceptOrder, areEquivalent } = expressionComparisons

// abx^3 + acx^2 + adx = ax(bx^2 + cx + d).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']

export default buildStepExercise({
	metadata: {
		skill: 'pullFactorOutOfBrackets',
		...createStepExerciseMetadata([undefined, 'addLikeFractionsWithVariables', 'simplifyFractionWithVariables', 'expandBrackets']),
		comparisons: {
			startingForm: (input: Expression, correct: Expression) => areEqualExceptOrder(input.flatten(), correct),
			splitUp: (input: Expression, correct: Expression, { expression, factor }: { expression: Expression, factor: Expression }) => {
				input = input.flatten()
				if (correct.isMinus()) {
					if (!input.isMinus()) return false
					input = input.argument
					correct = correct.argument
				}
				const positiveFactor = factor.isMinus() ? factor.argument : factor
				if (!positiveFactor.isProduct()) return false
				return input.isProduct() && input.factors.length === 3 && positiveFactor.factors.every(subFactor => input.factors.some(inputFactor => areEqualExceptOrder(inputFactor, subFactor))) && input.factors.some(inputFactor => inputFactor.isSum() && inputFactor.terms.length === expression.terms.length) && areEquivalent(input, correct)
			},
			ans: (input: Expression, correct: Expression) => areEqualExceptOrder(input.cancel(), correct),
			check: (input: Expression, correct: Expression) => areEqualExceptOrder(input.cancel(), correct),
		},
	},

	generateParameters() {
		const b = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		return {
			x: sample(variableSet),
			a: randomInteger(b < 0 ? 2 : -8, 8, { exclude: [-1, 0, 1] }),
			b,
			c: randomInteger(-8, 8, { exclude: [-1, 0, 1, -b, b] }),
			d: randomInteger(-8, 8, { exclude: [-1, 0, 1, -b, b] }),
			descending: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const factor = asExpression('a*x').substitute(variables).removeTrivial()
		const sum = asExpression(parameters.descending ? 'b*x^2+c*x+d' : 'd+c*x+b*x^2').substitute(variables).removeTrivial()
		const ans = factor.multiply(sum).combine()
		const expression = ans.combine(['expandProductsOfSums'])
		const startingForm = factor.multiply(expression.divide(factor)).flatten()
		const splitUp = factor.multiply(expression.divide(factor).removeTrivial(['splitFractions'])).flatten()
		const check = expression
		return { ...parameters, variables, factor, sum, expression, startingForm, splitUp, ans, check }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('startingForm', data)
			case 2: return compareInputs('splitUp', data)
			case 4: return compareInputs('check', data)
			default: return compareInputs('ans', data)
		}
	},
})
