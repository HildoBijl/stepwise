import { sample, randomInteger } from '@step-wise/js-utils'
import { repeat } from '@step-wise/skill-setup'
import { type Equation, asEquation, expressionComparisons, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '#generationTools'

// (ax+bz)y = cx + d.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd']

export default buildStepExercise({
	metaData: {
		skill: 'solveMultiVariableLinearEquation',
		...stepsToSetup(['expandBrackets', repeat('moveEquationTerm', 2), 'pullFactorOutOfBrackets', 'multiplyAllEquationTerms']),
		compare: {
			pulledOut: (input: Equation, correct: Equation) => equationComparisons.onlyOrderChangesAndSwitch(input, correct) || equationComparisons.onlyOrderChangesAndSwitch(input, correct.mapRight(side => side.negate()).mapLeft(side => side.mapFactors((factor, index) => index === 1 ? factor.negate() : factor)).normalize()), // Allow switches and minus signs inside the brackets.
			ans: expressionComparisons.equivalent, // For the final answer allow equivalent answers.
			Equation: (input: Equation, correct: Equation) => equationComparisons.onlyOrderChangesAndSwitch(input, correct) || equationComparisons.onlyOrderChangesAndSwitch(input, correct.negate().normalize()), // Allow switches and minus signs.
		},
	},

	generateState() {
		return {
			...selectRandomVariables(sample(availableVariableSets), usedVariables),
			a: randomInteger(-12, 12, [0]),
			b: randomInteger(-12, 12, [0]),
			c: randomInteger(-12, 12, [0]),
			d: randomInteger(-12, 12, [0]),
		}
	},

	getSolution(state) {
		// Extract state variables.
		const variables = filterVariables(state, usedVariables, constants)
		const equation = asEquation('(ax+bz)y = cx + d').substitute(variables).removeTrivial()

		// Find the solution.
		const bracketsExpanded = equation.flatten(['expandProductsOfSums'])
		const termsMoved = bracketsExpanded.subtract(bracketsExpanded.left.terms[1]).subtract(bracketsExpanded.right.terms[0]).removeTrivial(['cancelSumTerms'])
		const pulledOut = termsMoved.mapLeft(left => left.factorOut(variables.x).combine())
		const product = pulledOut.left.find(expression => expression.isProduct())
		if (!product?.isProduct()) throw new Error('Expected the isolated side to contain a product.')
		const bracketTerm = product.factors.find(factor => !factor.equalStructure(variables.x))
		if (!bracketTerm) throw new Error('Expected the isolated product to contain a bracket factor.')
		const ans = termsMoved.right.divide(bracketTerm)

		// Check the solution.
		const equationWithSolution = equation.substitute({ [variables.x.toString()]: ans })
		const equationWithSolutionMergedFractions = equationWithSolution.removeTrivial(['mergeFractionProducts', 'mergeFractionSums'])
		const equationWithSolutionExpandedBrackets = equationWithSolutionMergedFractions.combine(['expandProductsOfSums', 'expandMinusSums', 'sortSums'])

		return { ...state, variables, equation, termsMoved, bracketsExpanded, pulledOut, bracketTerm, ans, equationWithSolution, equationWithSolutionMergedFractions, equationWithSolutionExpandedBrackets }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('bracketsExpanded', data)
			case 2: return compare('termsMoved', data)
			case 3: return compare('pulledOut', data)
			default: return compare('ans', data)
		}
	},
})
