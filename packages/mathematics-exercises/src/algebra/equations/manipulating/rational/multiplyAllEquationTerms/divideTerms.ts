import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, asEquation, expressionComparisons, expressionChecks } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasSumWithinFraction } = expressionChecks

// Divide a*x^4+b*x^3+c*x^2+d*x=0 by ex^n.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e', 'n']

export default buildStepExercise({
	metaData: {
		skill: 'multiplyAllEquationTerms',
		...stepsToSetup(['multiplyBothEquationSides', 'addLikeFractionsWithVariables', 'simplifyFractionWithVariables']),
		compare: {
			form: { compareSide: equivalent },
			expanded: { compareSide: (input: Expression, correct: Expression) => !hasSumWithinFraction(input) && equivalent(input, correct) },
			ans: { compareSide: onlyOrderChanges },
		},
	},

	generateParameters(example) {
		return {
			x: sample(variableSet),
			a: randomInteger(-8, 8, { exclude: [0] }),
			b: randomInteger(-8, 8, { exclude: [0] }),
			c: randomInteger(-8, 8, { exclude: [0] }),
			d: example ? 0 : randomInteger(-8, 8, { exclude: [0] }),
			e: randomInteger(example ? 2 : -8, 8, { exclude: [-1, 0, 1] }),
			n: example ? 1 : randomInteger(1, 3),
			aLeft: example ? true : randomBoolean(),
			bLeft: randomBoolean(),
			cLeft: randomBoolean(),
			dLeft: randomBoolean(),
		}
	},

	getSolution(parameters) {
		// Assemble the equation.
		const variables = filterVariables(parameters, usedVariables, constants)
		const terms = ['a*x^4', 'b*x^3', 'c*x^2', 'd*x'].map(term => asExpression(term).substitute(variables))
		const termsLeft = [parameters.aLeft, parameters.bLeft, parameters.cLeft, parameters.dLeft]
		let left = asExpression(0)
		let right = asExpression(0)
		terms.forEach((term, index) => {
			if (termsLeft[index]) left = left.add(term)
			else right = right.add(term)
		})
		const equation = asEquation({ left, right }).removeTrivial()
		const factor = asExpression('e*x^n', { eAsConstant: false }).substitute(variables).removeTrivial()

		// Manipulate the equation.
		const form = equation.divide(factor)
		const expanded = form.removeTrivial(['splitFractions'])
		const ansIntermediate = expanded.cancel(['mergeFractionNumbers'])
		const ans = ansIntermediate.combine()
		return { ...parameters, variables, equation, factor, form, expanded, ansIntermediate, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('form', data)
			case 2: return compare('expanded', data)
			default: return compare('ans', data)
		}
	},
})
