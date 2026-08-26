import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, asEquation, expressionComparisons, expressionChecks } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// Multiply a*x+b+c/x+d/x^2=0 by ex^n.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e', 'n']

export default buildStepExercise({
	metadata: {
		skill: 'multiplyAllEquationTerms',
		...createStepExerciseMetadata(['multiplyBothEquationSides', 'expandBrackets', 'simplifyFractionWithVariables']),
		comparisons: {
			form: { compareSide: equivalent },
			expanded: { compareSide: (input: Expression, correct: Expression) => !hasSumWithinProduct(input) && equivalent(input, correct) },
			ans: { compareSide: onlyOrderChanges },
		},
	},

	generateParameters(example) {
		return {
			x: sample(variableSet),
			a: randomInteger(-8, 8, { exclude: [-1, 0, 1] }),
			b: randomInteger(-8, 8, { exclude: [0] }),
			c: randomInteger(-8, 8, { exclude: [-1, 0, 1] }),
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
		const terms = ['a*x', 'b', 'c/x', 'd/x^2'].map(term => asExpression(term).substitute(variables))
		const termsLeft = [parameters.aLeft, parameters.bLeft, parameters.cLeft, parameters.dLeft]
		let left = asExpression(0)
		let right = asExpression(0)
		terms.forEach((term, index) => {
			if (termsLeft[index]) left = left.add(term)
			else right = right.add(term)
		})
		const equation = asEquation({ left, right }).removeTrivial()
		const factor = asExpression('e*x^n', { interpretEAsConstant: false }).substitute(variables).removeTrivial()

		// Manipulate the equation.
		const form = equation.multiplyLeft(factor).flatten()
		const expandedIntermediate = form.removeTrivial(['expandProductsOfSums', 'expandMinusSums'])
		const expanded = expandedIntermediate.cancel(['expandProductsOfSums', 'mergeFractionProducts', 'mergeProductFactors'])
		const ans = expanded.combine()
		return { ...parameters, variables, equation, factor, form, expandedIntermediate, expanded, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('form', data)
			case 2: return compareInputs('expanded', data)
			default: return compareInputs('ans', data)
		}
	},
})
