import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/js-utils'
import { type Equation, type Expression, asExpression, asEquation, expressionComparisons, equationChecks } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasVariableInDenominator } = equationChecks

// (a*x+b)/(x+c)=d.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']
const factorMovedComparison = { compareSide: equivalent, allowSwitch: true }

export default buildStepExercise({
	metaData: {
		skill: 'solveLinearEquationWithFractions',
		...stepsToSetup(['moveEquationFactor', 'solveLinearEquation']),
		...{ factorMovedComparison },
		compare: {
			factorMoved: (input: Equation, correct: Equation, { variables }: { variables: Record<string, Expression> }) => !hasVariableInDenominator(input, variables.x) && correct.equals(input, factorMovedComparison),
			ans: onlyOrderChanges,
		},
	},

	generateState() {
		const a = getRandomInteger(-8, 8, [-1, 0, 1])
		const c = getRandomInteger(-8, 8, [-1, 0, 1])
		const b = getRandomInteger(-8, 8, [0, a * c])
		const d = getRandomInteger(-8, 8, [0, a])
		return { x: sample(variableSet), a, b, c, d, switchSides: getRandomBoolean() }
	},

	getSolution(state) {
		const { a, b, c, d, switchSides } = state
		const variables = filterVariables(state, usedVariables, constants)
		const baseEquation = asEquation('(a*x+b)/(x+c)=d').substitute(variables).removeTrivial()
		const equation = switchSides ? baseEquation.switch() : baseEquation.self()
		const baseFactorMoved = asEquation('a*x+b=d(x+c)').substitute(variables).removeTrivial()
		const factorMoved = switchSides ? baseFactorMoved.switch() : baseFactorMoved.self()
		const expanded = factorMoved.combine(['expandProductsOfSums'])
		const termMoved = asEquation(switchSides ? `d*x-a*x=b-(${d * c})` : `a*x-d*x=(${d * c})-b`).substitute(variables).removeTrivial()
		const cleaned = termMoved.combine()
		const factor = asExpression(switchSides ? d - a : a - d)
		const solution = asExpression(switchSides ? `(${b - d * c})/${d - a}` : `(${d * c - b})/${a - d}`)
		const ans = solution.combine()
		const canCleanSolution = !onlyOrderChanges(solution, ans)
		const equationInserted = equation.substitute({ [variables.x.toString()]: ans })
		const sideValue = equationInserted.left.normalize()
		return { ...state, variables, equation, factorMoved, expanded, termMoved, cleaned, factor, solution, ans, canCleanSolution, equationInserted, sideValue }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('factorMoved', data)
			default: return compare('ans', data)
		}
	},
})
