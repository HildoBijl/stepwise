import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, type Equation, asEquation, expressionComparisons, equationChecks, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasFractionWithinFraction } = equationChecks

// ax = b => x = b/a.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b']

const ansEqualsOptions = ({ switchSides }: { switchSides: boolean }) => ({ preprocessSide: (side: Expression) => side.cancel(), compareLeft: switchSides ? equivalent : onlyOrderChanges, compareRight: switchSides ? onlyOrderChanges : equivalent })

export default buildStepExercise({
	metadata: {
		skill: 'moveEquationFactor',
		...createStepExerciseMetadata(['multiplyBothEquationSides', 'cancelFractionFactors']),
		...{ ansEqualsOptions },
		comparisons: {
			bothSidesChanged: { compareSide: equivalent },
			ans: (input: Equation, correct: Equation, solution: { switchSides: boolean }) => !hasFractionWithinFraction(input) && correct.equals(input, ansEqualsOptions(solution)),
		},
	},

	generateParameters() {
		const a = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		const b = randomInteger(-8, 8, { exclude: [-1, 0, 1, a, -a] })
		return {
			x: sample(variableSet),
			a, b,
			switchSides: randomBoolean(), // Do we switch equation sides?
		}
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const factor = variables.a
		const baseEquation = asEquation('a*x=b')
		const equation = (parameters.switchSides ? baseEquation.switch() : baseEquation.self()).substitute(variables).removeTrivial()
		const bothSidesChanged = equation.divide(factor)
		const ans = parameters.switchSides ? bothSidesChanged.mapRight(side => side.cancel()) : bothSidesChanged.mapLeft(side => side.cancel())
		const ansCleaned = ans.cancel()
		const isFurtherSimplificationPossible = !equationComparisons.onlyOrderChanges(ans, ansCleaned)
		return { ...parameters, variables, factor, equation, bothSidesChanged, ans, ansCleaned, isFurtherSimplificationPossible }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('bothSidesChanged', data)
			default: return compareInputs('ans', data)
		}
	},
})
