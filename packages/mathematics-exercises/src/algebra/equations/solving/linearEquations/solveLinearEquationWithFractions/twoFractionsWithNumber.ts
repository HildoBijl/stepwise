import { sample, randomInteger } from '@step-wise/js-utils'
import { type Equation, type Expression, asExpression, asEquation, expressionComparisons, equationChecks } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#mathematicsExerciseBuilding'
import { selectExpressionParameters } from '#generationTools'

const { areEqualExceptOrder, areEquivalent } = expressionComparisons
const { hasVariableInDenominator } = equationChecks

// a/(x+b)=c/(x+d).
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
		const b = randomInteger(-8, 8, { exclude: [0] })
		const c = randomInteger(-8, 8, { exclude: [-1, 0, 1, a, -a] })
		const d = randomInteger(-8, 8, { exclude: [0, b, -b] })
		return { x: sample(variableSet), a, b, c, d }
	},

	getSolution(parameters) {
		const { a, b, c, d } = parameters
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const equation = asEquation('a/(x+b)=c/(x+d)').substitute(variables).removeTrivial()
		const factorMoved = asEquation('a(x+d)=c(x+b)').substitute(variables).removeTrivial()
		const expanded = factorMoved.combine(['expandProductsOfSums'])
		const termMoved = asEquation(`a*x - c*x = ${c * b}-(${a * d})`).substitute(variables).removeTrivial()
		const cleaned = termMoved.combine()
		const factor = asExpression(a - c)
		const solution = asExpression(`(${c * b - a * d})/${a - c}`)
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
