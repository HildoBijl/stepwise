import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/utils'
import { type Equation, asExpression, asEquation, expressionComparisons, equationChecks, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '../../../../../generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*(x+b)+e=c*(x+d).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e']

export default buildStepExercise({
	metaData: {
		weight: 2,
		skill: 'solveLinearEquation',
		...stepsToSetup(['expandBrackets', 'moveEquationTerm', 'mergeSimilarTerms', 'solveProductEquation']),
		compare: {
			expanded: (input: Equation, correct: Equation) => !equationChecks.hasSumWithinProduct(input) && equationComparisons.equivalent(input, correct),
			moved: { compareSide: equivalent, allowSwitch: true, allowMinus: true },
			cleaned: { compareSide: onlyOrderChanges, allowSwitch: true, allowMinus: true },
			ans: onlyOrderChanges,
		},
	},

	generateState() {
		const a = getRandomInteger(-8, 8, [-1, 0, 1])
		const b = getRandomInteger(-8, 8, [0, a, -a])
		const c = getRandomInteger(-8, 8, [-1, 0, 1, a])
		const d = getRandomInteger(-8, 8, [0])
		const e = getRandomInteger(-8, 8, [0])
		return { x: sample(variableSet), a, b, c, d, e, switchSides: getRandomBoolean(), bracketsRight: getRandomBoolean() }
	},

	getSolution(state) {
		const { a, b, c, d, e, switchSides, bracketsRight } = state
		const variables = filterVariables(state, usedVariables, constants)
		const baseEquation = asEquation(bracketsRight ? 'a*(x+b)+e=c*(x+d)' : 'a*(x+b)+e=c*x+d', { eAsConstant: false }).substitute(variables).removeTrivial()
		const equation = switchSides ? baseEquation.switch() : baseEquation.self()
		const baseMoved = asEquation(`a*x-c*x=${bracketsRight ? c * d : d}-(${a * b + e})`).substitute(variables).removeTrivial(['expandMinusSums'])
		const moved = switchSides ? baseMoved.negate().removeTrivial(['expandMinusSums', 'removeDoubleNegatives']) : baseMoved.self()
		const cleaned = moved.combine()
		const factor = asExpression(switchSides ? c - a : a - c)
		const solution = asExpression(`${(bracketsRight ? c * d : d) - (a * b + e)}/${a - c}`)
		const ans = solution.normalize()
		const canCleanSolution = !onlyOrderChanges(solution, ans)
		const equationInserted = equation.substitute({ [variables.x.toString()]: ans })
		const sideValue = equationInserted.left.normalize()
		return { ...state, variables, equation, expanded: equation.combine(['expandProductsOfSums']), moved, cleaned, factor, solution, ans, canCleanSolution, equationInserted, sideValue }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('expanded', data)
			case 2: return compare('moved', data)
			case 3: return compare('cleaned', data)
			default: return compare('ans', data)
		}
	},
})
