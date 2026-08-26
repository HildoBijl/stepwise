import { sample, randomInteger } from '@step-wise/js-utils'
import { repeat } from '@step-wise/skill-setup'
import { type Equation, asEquation, expressionComparisons, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectRandomVariables, selectExpressionParameters } from '#generationTools'

// x/y + a = bz + cx.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metadata: {
		skill: 'solveMultiVariableLinearEquation',
		...createStepExerciseMetadata([repeat('moveEquationTerm', 2), 'pullFactorOutOfBrackets', 'multiplyAllEquationTerms']),
		comparisons: {
			pulledOut: (input: Equation, correct: Equation) => equationComparisons.onlyOrderChangesAndSwitch(input, correct) || equationComparisons.onlyOrderChangesAndSwitch(input, correct.mapRight(side => side.negate()).mapLeft(side => side.mapFactors((factor, index) => index === 1 ? factor.negate() : factor)).normalize()), // Allow switches and minus signs inside the brackets.
			ans: expressionComparisons.equivalent, // For the final answer allow equivalent answers.
			Equation: (input: Equation, correct: Equation) => equationComparisons.onlyOrderChangesAndSwitch(input, correct) || equationComparisons.onlyOrderChangesAndSwitch(input, correct.negate().normalize()), // Allow switches and minus signs.
		},
	},

	generateParameters() {
		return {
			...selectRandomVariables(sample(availableVariableSets), usedVariables),
			a: randomInteger(-12, 12, { exclude: [0] }),
			b: randomInteger(-12, 12, { exclude: [0] }),
			c: randomInteger(-12, 12, { exclude: [0] }),
		}
	},

	getSolution(parameters) {
		// Extract parameters variables.
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const equation = asEquation('x/y + a = bz + cx').substitute(variables).removeTrivial()

		// Find the solution.
		const termsMoved = equation.subtract(equation.left.terms[1]).subtract(equation.right.terms[1]).removeTrivial(['cancelSumTerms'])
		const pulledOut = termsMoved.mapLeft(left => left.factorOut(variables.x).combine())
		const product = pulledOut.left.find(expression => expression.isProduct())
		if (!product?.isProduct()) throw new Error('Expected the isolated side to contain a product.')
		const bracketTerm = product.factors.find(factor => !factor.equalStructure(variables.x))
		if (!bracketTerm) throw new Error('Expected the isolated product to contain a bracket factor.')
		const ans = termsMoved.right.divide(bracketTerm)
		const ansCleaned = ans.normalize(['expandProductsOfSums'])

		// Check the solution.
		const equationWithSolution = equation.substitute({ [variables.x.toString()]: ansCleaned })
		const equationWithSolutionMergedFractions = equationWithSolution.removeTrivial(['flattenFractions', 'expandMinusSums', 'mergeFractionProducts', 'mergeFractionSums'])
		const equationWithSolutionExpandedBrackets = equationWithSolutionMergedFractions.combine(['expandProductsOfSums', 'expandMinusSums', 'sortSums'])

		return { ...parameters, variables, equation, termsMoved, pulledOut, bracketTerm, ans, ansCleaned, equationWithSolution, equationWithSolutionMergedFractions, equationWithSolutionExpandedBrackets }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('termsMoved', data)
			case 2: return compareInputs('pulledOut', data)
			default: return compareInputs('ans', data)
		}
	},
})
