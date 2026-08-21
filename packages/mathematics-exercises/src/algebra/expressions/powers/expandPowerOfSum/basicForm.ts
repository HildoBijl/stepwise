import { sample, randomInteger, repeat, fromKeysAndValues } from '@step-wise/js-utils'
import { binomialCoefficient } from '@step-wise/math-tools'
import { repeat as skillRepeat } from '@step-wise/skill-setup'
import { asExpression, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { onlyOrderChanges } = expressionComparisons

// (a*x^b+c*x^d)^e
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e']

export default buildStepExercise({
	metaData: {
		skill: 'expandPowerOfSum',
		...stepsToSetup([skillRepeat('simplifyProductOfPowers', 2), undefined, 'simplifyNumberProduct']),
		compare: {
			Expression: onlyOrderChanges,
		},
	},

	generateParameters(example) {
		const a = randomInteger(example ? 2 : -4, 4, { exclude: [-1, 0, 1] })
		const b = randomInteger(1, example ? 1 : 2)
		const c = randomInteger(example ? 2 : -6, 6, { exclude: [-1, 0, 1, -a, a] })
		const d = randomInteger(0, example ? 0 : 1, { exclude: [b] })
		const e = randomInteger(example ? 2 : 3, example || Math.max(Math.abs(a), Math.abs(c)) >= 5 ? 4 : 5)
		return {
			x: sample(variableSet),
			a, b, c, d, e,
		}
	},

	getSolution(parameters) {
		const { e } = parameters
		const variables = filterVariables(parameters, usedVariables, constants)
		const t1 = asExpression('a*x^b').substitute(variables).removeTrivial()
		const t2 = asExpression('c*x^d').substitute(variables).removeTrivial()
		const expression = t1.add(t2).toPower(e)
		const terms = repeat(e + 1, n => t1.toPower(e - n).multiply(t2.toPower(n)))
		const termsSimplified = terms.map(term => term.normalize())
		const coefficients = repeat(e + 1, n => binomialCoefficient(e, n))
		const termsMultiplied = coefficients.map((coefficient, index) => asExpression(coefficient).multiply(termsSimplified[index]))
		const sum = termsMultiplied[0].add(...termsMultiplied.slice(1))
		const ans = sum.combine()
		const termsNames = repeat(e + 1, index => `term${index}`)
		const coefficientsNames = repeat(e + 1, index => `c${index}`)
		return { ...parameters, variables, t1, t2, expression, terms, termsSimplified, coefficients, sum, ans, ...fromKeysAndValues(termsNames, termsSimplified), termsNames, ...fromKeysAndValues(coefficientsNames, coefficients), coefficientsNames }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare(data.solution!.termsNames, data)
			case 2: return compare(data.solution!.coefficientsNames, data)
			default: return compare('ans', data)
		}
	},
})
