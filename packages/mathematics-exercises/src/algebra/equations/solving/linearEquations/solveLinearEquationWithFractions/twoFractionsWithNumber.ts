import { sample, randomInteger } from '@step-wise/js-utils'
import { type Equation, type Expression, asExpression, asEquation, expressionComparisons, equationChecks } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasVariableInDenominator } = equationChecks

// a/(x+b)=c/(x+d).
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
		const a = randomInteger(-8, 8, [-1, 0, 1])
		const b = randomInteger(-8, 8, [0])
		const c = randomInteger(-8, 8, [-1, 0, 1, a, -a])
		const d = randomInteger(-8, 8, [0, b, -b])
		return { x: sample(variableSet), a, b, c, d }
	},

	getSolution(state) {
		const { a, b, c, d } = state
		const variables = filterVariables(state, usedVariables, constants)
		const equation = asEquation('a/(x+b)=c/(x+d)').substitute(variables).removeTrivial()
		const factorMoved = asEquation('a(x+d)=c(x+b)').substitute(variables).removeTrivial()
		const expanded = factorMoved.combine(['expandProductsOfSums'])
		const termMoved = asEquation(`a*x - c*x = ${c * b}-(${a * d})`).substitute(variables).removeTrivial()
		const cleaned = termMoved.combine()
		const factor = asExpression(a - c)
		const solution = asExpression(`(${c * b - a * d})/${a - c}`)
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
