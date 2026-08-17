import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/js-utils'
import { asExpression, asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons

// ax^2 + bx + c = 0.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metaData: {
		skill: 'moveEquationTerm',
		...stepsToSetup(['addToBothEquationSides', 'cancelSumTerms']),
		compare: {
			bothSidesChanged: { compareSide: equivalent },
			ans: { compareSide: onlyOrderChanges },
		},
	},

	generateState(example) {
		const a = getRandomInteger(-8, 8, [0])
		const b = getRandomInteger(-8, 8, [0, a, -a])
		const c = getRandomInteger(-8, 8, [0, a, -a, b, -b])
		return {
			x: sample(variableSet),
			a, b, c,
			switchSides: [getRandomBoolean(), getRandomBoolean(), getRandomBoolean()], // Does a term start on the other side of the equation?
			toMove: example ? 1 : getRandomInteger(0, 2),
		}
	},

	getSolution(state) {
		// Set up the equation.
		const variables = filterVariables(state, usedVariables, constants)
		const terms = ['a*x^2', 'b*x', 'c'].map(term => asExpression(term).substitute(variables).removeTrivial())
		let equation = asEquation('0 = 0')
		terms.forEach((term, index) => {
			equation = state.switchSides[index] ? equation.mapRight(side => side.add(term)) : equation.mapLeft(side => side.add(term))
		})
		equation = equation.removeTrivial()

		// Find the term to move, add/subtract it and simplify.
		const termIsLeft = !state.switchSides[state.toMove]
		const positive = !terms[state.toMove].isMinus()
		const termToMove = terms[state.toMove].abs()
		const bothSidesChanged = positive ? equation.subtract(termToMove) : equation.add(termToMove)
		const ans = bothSidesChanged.cancel()

		// Also set up possibly wrong answers.
		const ansWithWrongSignUsed = (termIsLeft ? ans.mapRight(side => positive ? side.add(termToMove.multiply(2)) : side.subtract(termToMove.multiply(2))) : ans.mapLeft(side => positive ? side.add(termToMove.multiply(2)) : side.subtract(termToMove.multiply(2)))).combine()
		return { ...state, variables, terms, equation, termIsLeft, positive, termToMove, bothSidesChanged, ans, ansWithWrongSignUsed }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('bothSidesChanged', data)
			default: return compare('ans', data)
		}
	},
})
