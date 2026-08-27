import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { asExpression, asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { onlyOrderChanges, areEquivalent } = expressionComparisons

// ax^2 + bx + c = 0.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metadata: {
		skill: 'moveEquationTerm',
		...createStepExerciseMetadata(['addToBothEquationSides', 'cancelSumTerms']),
		comparisons: {
			bothSidesChanged: { compareSide: areEquivalent },
			ans: { compareSide: onlyOrderChanges },
		},
	},

	generateParameters(example) {
		const a = randomInteger(-8, 8, { exclude: [0] })
		const b = randomInteger(-8, 8, { exclude: [0, a, -a] })
		const c = randomInteger(-8, 8, { exclude: [0, a, -a, b, -b] })
		return {
			x: sample(variableSet),
			a, b, c,
			switchSides: [randomBoolean(), randomBoolean(), randomBoolean()], // Does a term start on the other side of the equation?
			toMove: example ? 1 : randomInteger(0, 2),
		}
	},

	getSolution(parameters) {
		// Set up the equation.
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const terms = ['a*x^2', 'b*x', 'c'].map(term => asExpression(term).substitute(variables).removeTrivial())
		let equation = asEquation('0 = 0')
		terms.forEach((term, index) => {
			equation = parameters.switchSides[index] ? equation.mapRight(side => side.add(term)) : equation.mapLeft(side => side.add(term))
		})
		equation = equation.removeTrivial()

		// Find the term to move, add/subtract it and simplify.
		const termIsLeft = !parameters.switchSides[parameters.toMove]
		const positive = !terms[parameters.toMove].isMinus()
		const termToMove = terms[parameters.toMove].stripSigns()
		const bothSidesChanged = positive ? equation.subtract(termToMove) : equation.add(termToMove)
		const ans = bothSidesChanged.cancel()

		// Also set up possibly wrong answers.
		const ansWithWrongSignUsed = (termIsLeft ? ans.mapRight(side => positive ? side.add(termToMove.multiply(2)) : side.subtract(termToMove.multiply(2))) : ans.mapLeft(side => positive ? side.add(termToMove.multiply(2)) : side.subtract(termToMove.multiply(2)))).combine()
		return { ...parameters, variables, terms, equation, termIsLeft, positive, termToMove, bothSidesChanged, ans, ansWithWrongSignUsed }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('bothSidesChanged', data)
			default: return compareInputs('ans', data)
		}
	},
})
