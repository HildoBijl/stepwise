import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Equation, type Expression, asExpression, asEquation, expressionComparisons, equationChecks } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasVariableInDenominator } = equationChecks

// a/(x+b)+c=d.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']
const factorMovedComparison = { compareSide: equivalent, allowSwitch: true }

export default buildStepExercise({
	metaData: {
		skill: 'solveLinearEquationWithFractions',
		...createStepExerciseMetadata(['moveEquationTerm', 'moveEquationFactor', 'solveLinearEquation']),
		...{ factorMovedComparison },
		compare: {
			termMoved: { compareSide: onlyOrderChanges, allowSwitch: true },
			factorMoved: (input: Equation, correct: Equation, { variables }: { variables: Record<string, Expression> }) => !hasVariableInDenominator(input, variables.x) && correct.equals(input, factorMovedComparison),
			ans: onlyOrderChanges,
		},
	},

	generateParameters() {
		const a = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		const b = randomInteger(-8, 8, { exclude: [0] })
		const c = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		const d = randomInteger(-8, 8, { exclude: [0, c, -c] })
		return { x: sample(variableSet), a, b, c, d, switchSides: randomBoolean() }
	},

	getSolution(parameters) {
		const { a, b, c, d, switchSides } = parameters
		const variables = filterVariables(parameters, usedVariables, constants)
		const baseEquation = asEquation('a/(x+b)+c=d').substitute(variables).removeTrivial()
		const equation = switchSides ? baseEquation.switch() : baseEquation.self()
		const baseTermMoved = asEquation(`a/(x+b)=${d - c}`).substitute(variables).removeTrivial()
		const termMoved = switchSides ? baseTermMoved.switch() : baseTermMoved.self()
		const baseFactorMoved = asEquation(`a=${d - c}(x+b)`).substitute(variables).removeTrivial()
		const factorMoved = switchSides ? baseFactorMoved.switch() : baseFactorMoved.self()
		const expanded = factorMoved.combine(['expandProductsOfSums'])
		const baseCleaned = asEquation(`a-(${(d - c) * b})=${d - c}x`).substitute(variables).combine()
		const cleaned = switchSides ? baseCleaned.switch() : baseCleaned.self()
		const factor = asExpression(d - c)
		const solution = asExpression(`(${a - (d - c) * b})/${d - c}`)
		const ans = solution.combine()
		const canCleanSolution = !onlyOrderChanges(solution, ans)
		const equationInserted = equation.substitute({ [variables.x.toString()]: ans })
		const sideValue = equationInserted.left.normalize()
		return { ...parameters, variables, equation, termMoved, factorMoved, expanded, cleaned, factor, solution, ans, canCleanSolution, equationInserted, sideValue }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('termMoved', data)
			case 2: return compare('factorMoved', data)
			default: return compare('ans', data)
		}
	},
})
