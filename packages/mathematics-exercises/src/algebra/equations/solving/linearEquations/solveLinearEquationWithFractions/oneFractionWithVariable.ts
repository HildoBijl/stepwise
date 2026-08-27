import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Equation, type Expression, asExpression, asEquation, expressionComparisons, equationChecks } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { areEqualExceptOrder, areEquivalent } = expressionComparisons
const { hasVariableInDenominator } = equationChecks

// (a*x+b)/(x+c)=d.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']
const factorMovedComparison = { compareSide: areEquivalent, allowSideSwitch: true }

export default buildStepExercise({
	metadata: {
		skill: 'solveLinearEquationWithFractions',
		...createStepExerciseMetadata(['moveEquationFactor', 'solveLinearEquation']),
		...{ factorMovedComparison },
		comparisons: {
			factorMoved: (input: Equation, correct: Equation, { variables }: { variables: Record<string, Expression> }) => !hasVariableInDenominator(input, variables.x) && correct.equals(input, factorMovedComparison),
			ans: areEqualExceptOrder,
		},
	},

	generateParameters() {
		const a = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		const c = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		const b = randomInteger(-8, 8, { exclude: [0, a * c] })
		const d = randomInteger(-8, 8, { exclude: [0, a] })
		return { x: sample(variableSet), a, b, c, d, switchSides: randomBoolean() }
	},

	getSolution(parameters) {
		const { a, b, c, d, switchSides } = parameters
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const baseEquation = asEquation('(a*x+b)/(x+c)=d').substitute(variables).removeTrivial()
		const equation = switchSides ? baseEquation.switchSides() : baseEquation.self()
		const baseFactorMoved = asEquation('a*x+b=d(x+c)').substitute(variables).removeTrivial()
		const factorMoved = switchSides ? baseFactorMoved.switchSides() : baseFactorMoved.self()
		const expanded = factorMoved.combine(['expandProductsOfSums'])
		const termMoved = asEquation(switchSides ? `d*x-a*x=b-(${d * c})` : `a*x-d*x=(${d * c})-b`).substitute(variables).removeTrivial()
		const cleaned = termMoved.combine()
		const factor = asExpression(switchSides ? d - a : a - d)
		const solution = asExpression(switchSides ? `(${b - d * c})/${d - a}` : `(${d * c - b})/${a - d}`)
		const ans = solution.combine()
		const canCleanSolution = !areEqualExceptOrder(solution, ans)
		const equationInserted = equation.substitute({ [variables.x.toString()]: ans })
		const sideValue = equationInserted.left.normalize()
		return { ...parameters, variables, equation, factorMoved, expanded, termMoved, cleaned, factor, solution, ans, canCleanSolution, equationInserted, sideValue }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('factorMoved', data)
			default: return compareInputs('ans', data)
		}
	},
})
