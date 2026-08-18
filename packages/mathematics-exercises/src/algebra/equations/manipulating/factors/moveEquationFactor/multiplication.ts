import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, type Equation, asEquation, expressionComparisons, equationChecks, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasFractionWithinFraction } = equationChecks

// a = b/(cx) => a[..] = b/[..].
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c']

const ansEqualsOptions = ({ switchSides }: { switchSides: boolean }) => ({ preprocessSide: (side: Expression) => side.cancel(), compareLeft: switchSides ? equivalent : onlyOrderChanges, compareRight: switchSides ? onlyOrderChanges : equivalent })

export default buildStepExercise({
	metaData: {
		skill: 'moveEquationFactor',
		...stepsToSetup(['multiplyBothEquationSides', 'cancelFractionFactors']),
		...{ ansEqualsOptions },
		compare: {
			bothSidesChanged: { compareSide: equivalent },
			ans: (input: Equation, correct: Equation, solution: { switchSides: boolean }) => !hasFractionWithinFraction(input) && correct.equals(input, ansEqualsOptions(solution)),
		},
	},

	generateState() {
		const a = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		const b = randomInteger(-8, 8, { exclude: [-1, 0, 1, a, -a] })
		const c = randomInteger(-8, 8, { exclude: [-1, 0, 1, a, -a, b, -b] })
		return {
			x: sample(variableSet),
			a, b, c,
			switchSides: randomBoolean(), // Do we switch equation sides?
			type: randomInteger(0, 2), // 0 is move c, 1 is move x, 2 is move c and x together.
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const factor = [variables.c, variables.x, variables.c.multiply(variables.x)][state.type].removeTrivial()
		const baseEquation = asEquation('a=b/(c*x)')
		const equation = (state.switchSides ? baseEquation.switch() : baseEquation.self()).substitute(variables).removeTrivial()
		const bothSidesChanged = equation.multiply(factor).removeTrivial(['mergeFractionProducts'], ['mergeProductMinuses', 'mergeProductPlusMinuses'])
		const ans = state.switchSides ? bothSidesChanged.mapLeft(side => side.removeTrivial(['mergeFractionMinuses', 'cancelFractionFactors'])) : bothSidesChanged.mapRight(side => side.removeTrivial(['mergeFractionMinuses', 'cancelFractionFactors']))
		const ansCleaned = ans.normalize()
		const isFurtherSimplificationPossible = !equationComparisons.onlyOrderChanges(ans, ansCleaned)
		return { ...state, variables, factor, equation, bothSidesChanged, ans, ansCleaned, isFurtherSimplificationPossible }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('bothSidesChanged', data)
			default: return compare('ans', data)
		}
	},
})
