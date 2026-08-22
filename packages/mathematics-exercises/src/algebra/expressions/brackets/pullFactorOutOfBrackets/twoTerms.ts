import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons

// abx^(n+1) + acx^n = ax^n(bx + c).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'n']

export default buildStepExercise({
	metaData: {
		skill: 'pullFactorOutOfBrackets',
		...createStepExerciseMetadata([undefined, 'addLikeFractionsWithVariables', 'simplifyFractionWithVariables', 'expandBrackets']),
		compare: {
			startingForm: (input: Expression, correct: Expression) => onlyOrderChanges(input.flatten(), correct),
			splitUp: (input: Expression, correct: Expression, { expression, factor }: { expression: Expression, factor: Expression }) => {
				input = input.flatten()
				if (correct.isMinus()) {
					if (!input.isMinus()) return false
					input = input.argument
					correct = correct.argument
				}
				const positiveFactor = factor.isMinus() ? factor.argument : factor
				if (!positiveFactor.isProduct()) return false
				return input.isProduct() && input.factors.length === 3 && positiveFactor.factors.every(subFactor => input.factors.some(inputFactor => onlyOrderChanges(inputFactor, subFactor))) && input.factors.some(inputFactor => inputFactor.isSum() && inputFactor.terms.length === expression.terms.length) && equivalent(input, correct)
			},
			ans: (input: Expression, correct: Expression) => onlyOrderChanges(input.cancel(), correct),
			check: (input: Expression, correct: Expression) => onlyOrderChanges(input.cancel(), correct),
		},
	},

	generateParameters(example) {
		const b = randomInteger(example ? 2 : -8, 8, { exclude: [-1, 0, 1] })
		return {
			x: sample(variableSet),
			a: randomInteger(example || b < 0 ? 2 : -8, 8, { exclude: [-1, 0, 1] }),
			b,
			c: randomInteger(-8, 8, { exclude: [-1, 0, 1, -b, b] }),
			n: example ? 1 : randomInteger(2, 4),
			descending: example ? true : randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = filterVariables(parameters, usedVariables, constants)
		const factor = asExpression('a*x^n').substitute(variables).removeTrivial()
		const sum = asExpression(parameters.descending ? 'b*x+c' : 'c+b*x').substitute(variables).removeTrivial()
		const ans = factor.multiply(sum).combine()
		const expression = ans.combine(['expandProductsOfSums'])
		const startingForm = factor.multiply(expression.divide(factor)).flatten()
		const splitUp = factor.multiply(expression.divide(factor).removeTrivial(['splitFractions'])).flatten()
		const check = expression
		return { ...parameters, variables, factor, sum, expression, startingForm, splitUp, ans, check }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('startingForm', data)
			case 2: return compare('splitUp', data)
			case 4: return compare('check', data)
			default: return compare('ans', data)
		}
	},
})
