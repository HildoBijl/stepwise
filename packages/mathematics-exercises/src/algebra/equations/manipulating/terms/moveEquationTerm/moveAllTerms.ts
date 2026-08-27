import { sample, randomInteger, randomBoolean, randomIndices } from '@step-wise/js-utils'
import { asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { areEqualExceptOrder, areEquivalent } = expressionComparisons

// ax^3 + bx^2 + cx + d = 0.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']

export default buildStepExercise({
	metadata: {
		skill: 'moveEquationTerm',
		...createStepExerciseMetadata(['addToBothEquationSides', 'cancelSumTerms']),
		comparisons: {
			bothSidesChanged: { compareSide: areEquivalent },
			ans: { compareSide: areEqualExceptOrder },
		},
	},

	generateParameters() {
		const a = randomInteger(-8, 8, { exclude: [0] })
		const b = randomInteger(-8, 8, { exclude: [0, a, -a] })
		const c = randomInteger(-8, 8, { exclude: [0, a, -a, b, -b] })
		const d = randomInteger(-8, 8, { exclude: [0, a, -a, b, -b, c, -c] })
		return {
			x: sample(variableSet),
			a, b, c, d,
			termsLeft: randomIndices(4, { count: 2 }),
			toLeft: randomBoolean(),
		}
	},

	getSolution(parameters) {
		// Set up the equation.
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		let equation = asEquation('0=a*x^3+b*x^2+c*x+d').substitute(variables).removeTrivial()
		const termsToSubtract = parameters.termsLeft.map(index => equation.right.terms[index])
		termsToSubtract.forEach(termToSubtract => { equation = equation.subtract(termToSubtract).cancel() })

		// Find the term to move, add/subtract it and simplify.
		const sideToMove = parameters.toLeft ? equation.right : equation.left
		const termsToMove = sideToMove.terms
		const positive = termsToMove.some(term => !term.isMinus())
		const bothSidesChanged = equation.subtract(sideToMove).flatten(['removeDoubleNegatives', 'expandMinusSums'])
		const ans = bothSidesChanged.cancel()

		// Also set up possibly wrong answers.
		const sidesAdded = equation.left.add(equation.right)
		const ansWithWrongSignUsed = asEquation({ left: parameters.toLeft ? sidesAdded : 0, right: parameters.toLeft ? 0 : sidesAdded }).combine()
		return { ...parameters, variables, equation, sideToMove, termsToMove, positive, bothSidesChanged, ans, ansWithWrongSignUsed }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('bothSidesChanged', data)
			default: return compareInputs('ans', data)
		}
	},
})
