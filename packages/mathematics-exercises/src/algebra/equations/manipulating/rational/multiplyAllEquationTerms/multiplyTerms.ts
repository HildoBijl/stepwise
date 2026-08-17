import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, asEquation, expressionComparisons, expressionChecks } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// Multiply a*x+b+c/x+d/x^2=0 by ex^n.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e', 'n']

export default buildStepExercise({
	metaData: {
		skill: 'multiplyAllEquationTerms',
		...stepsToSetup(['multiplyBothEquationSides', 'expandBrackets', 'simplifyFractionWithVariables']),
		compare: {
			form: { compareSide: equivalent },
			expanded: { compareSide: (input: Expression, correct: Expression) => !hasSumWithinProduct(input) && equivalent(input, correct) },
			ans: { compareSide: onlyOrderChanges },
		},
	},

	generateState(example) {
		return {
			x: sample(variableSet),
			a: getRandomInteger(-8, 8, [-1, 0, 1]),
			b: getRandomInteger(-8, 8, [0]),
			c: getRandomInteger(-8, 8, [-1, 0, 1]),
			d: example ? 0 : getRandomInteger(-8, 8, [0]),
			e: getRandomInteger(example ? 2 : -8, 8, [-1, 0, 1]),
			n: example ? 1 : getRandomInteger(1, 3),
			aLeft: example ? true : getRandomBoolean(),
			bLeft: getRandomBoolean(),
			cLeft: getRandomBoolean(),
			dLeft: getRandomBoolean(),
		}
	},

	getSolution(state) {
		// Assemble the equation.
		const variables = filterVariables(state, usedVariables, constants)
		const terms = ['a*x', 'b', 'c/x', 'd/x^2'].map(term => asExpression(term).substitute(variables))
		const termsLeft = [state.aLeft, state.bLeft, state.cLeft, state.dLeft]
		let left = asExpression(0)
		let right = asExpression(0)
		terms.forEach((term, index) => {
			if (termsLeft[index]) left = left.add(term)
			else right = right.add(term)
		})
		const equation = asEquation({ left, right }).removeTrivial()
		const factor = asExpression('e*x^n', { eAsConstant: false }).substitute(variables).removeTrivial()

		// Manipulate the equation.
		const form = equation.multiplyLeft(factor).flatten()
		const expandedIntermediate = form.removeTrivial(['expandProductsOfSums', 'expandMinusSums'])
		const expanded = expandedIntermediate.cancel(['expandProductsOfSums', 'mergeFractionProducts', 'mergeProductFactors'])
		const ans = expanded.combine()
		return { ...state, variables, equation, factor, form, expandedIntermediate, expanded, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('form', data)
			case 2: return compare('expanded', data)
			default: return compare('ans', data)
		}
	},
})
