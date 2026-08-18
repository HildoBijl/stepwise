import { sample, randomInteger, randomBoolean, randomIndices } from '@step-wise/js-utils'
import { asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons

// ax^3 + bx^2 + cx + d = 0.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']

export default buildStepExercise({
	metaData: {
		skill: 'moveEquationTerm',
		...stepsToSetup(['addToBothEquationSides', 'cancelSumTerms']),
		compare: {
			bothSidesChanged: { compareSide: equivalent },
			ans: { compareSide: onlyOrderChanges },
		},
	},

	generateState() {
		const a = randomInteger(-8, 8, [0])
		const b = randomInteger(-8, 8, [0, a, -a])
		const c = randomInteger(-8, 8, [0, a, -a, b, -b])
		const d = randomInteger(-8, 8, [0, a, -a, b, -b, c, -c])
		return {
			x: sample(variableSet),
			a, b, c, d,
			termsLeft: randomIndices(4, { count: 2 }),
			toLeft: randomBoolean(),
		}
	},

	getSolution(state) {
		// Set up the equation.
		const variables = filterVariables(state, usedVariables, constants)
		let equation = asEquation('0=a*x^3+b*x^2+c*x+d').substitute(variables).removeTrivial()
		const termsToSubtract = state.termsLeft.map(index => equation.right.terms[index])
		termsToSubtract.forEach(termToSubtract => { equation = equation.subtract(termToSubtract).cancel() })

		// Find the term to move, add/subtract it and simplify.
		const sideToMove = state.toLeft ? equation.right : equation.left
		const termsToMove = sideToMove.terms
		const positive = termsToMove.some(term => !term.isMinus())
		const bothSidesChanged = equation.subtract(sideToMove).flatten(['removeDoubleNegatives', 'expandMinusSums'])
		const ans = bothSidesChanged.cancel()

		// Also set up possibly wrong answers.
		const sidesAdded = equation.left.add(equation.right)
		const ansWithWrongSignUsed = asEquation({ left: state.toLeft ? sidesAdded : 0, right: state.toLeft ? 0 : sidesAdded }).combine()
		return { ...state, variables, equation, sideToMove, termsToMove, positive, bothSidesChanged, ans, ansWithWrongSignUsed }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('bothSidesChanged', data)
			default: return compare('ans', data)
		}
	},
})
