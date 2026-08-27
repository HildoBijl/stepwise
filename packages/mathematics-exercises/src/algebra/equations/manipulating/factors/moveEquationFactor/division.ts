import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, type Equation, asEquation, expressionComparisons, equationChecks, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { onlyOrderChanges, areEquivalent } = expressionComparisons
const { hasFractionWithinFraction } = equationChecks

// ax = b/c => [..] = b/(c[..]).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c']

const ansEqualsOptions = ({ switchSides }: { switchSides: boolean }) => ({ preprocessSide: (side: Expression) => side.cancel(), compareLeft: switchSides ? areEquivalent : onlyOrderChanges, compareRight: switchSides ? onlyOrderChanges : areEquivalent })

export default buildStepExercise({
	metadata: {
		skill: 'moveEquationFactor',
		...createStepExerciseMetadata(['multiplyBothEquationSides', 'cancelFractionFactors', 'multiplyDivideFractions']),
		...{ ansEqualsOptions },
		comparisons: {
			bothSidesChanged: { compareSide: areEquivalent },
			fractionFactorsCanceled: (input: Equation, correct: Equation, solution: { switchSides: boolean }) => correct.equals(input, ansEqualsOptions(solution)),
			ans: (input: Equation, correct: Equation, solution: { switchSides: boolean }) => !hasFractionWithinFraction(input) && correct.equals(input, ansEqualsOptions(solution)),
		},
	},

	generateParameters() {
		const a = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		const b = randomInteger(-8, 8, { exclude: [-1, 0, 1, a, -a] })
		const c = randomInteger(-8, 8, { exclude: [-1, 0, 1, a, -a, b, -b] })
		return {
			x: sample(variableSet),
			a, b, c,
			switchSides: randomBoolean(), // Do we switch equation sides?
			type: randomInteger(0, 2), // 0 is move a, 1 is move x, 2 is move a and x together.
		}
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const factor = [variables.a, variables.x, variables.a.multiply(variables.x)][parameters.type].removeTrivial()
		const baseEquation = asEquation('a*x=b/c')
		const equation = (parameters.switchSides ? baseEquation.switch() : baseEquation.self()).substitute(variables).removeTrivial()
		const bothSidesChanged = equation.divide(factor)
		const fractionFactorsCanceled = parameters.switchSides ? bothSidesChanged.mapRight(side => side.cancel(['combineNumbersInFractions', 'cancelFractionFactors', 'flattenFractions'])) : bothSidesChanged.mapLeft(side => side.cancel(['combineNumbersInFractions', 'cancelFractionFactors', 'flattenFractions']))
		const ans = fractionFactorsCanceled.removeTrivial(['flattenFractions'])
		const ansCleaned = ans.normalize()
		const isFurtherSimplificationPossible = !equationComparisons.onlyOrderChanges(ans, ansCleaned)
		return { ...parameters, variables, factor, equation, bothSidesChanged, fractionFactorsCanceled, ans, ansCleaned, isFurtherSimplificationPossible }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('bothSidesChanged', data)
			case 2: return compareInputs('fractionFactorsCanceled', data)
			default: return compareInputs('ans', data)
		}
	},
})
