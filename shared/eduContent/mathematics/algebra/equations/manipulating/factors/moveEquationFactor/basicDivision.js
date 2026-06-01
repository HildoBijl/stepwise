const { sample, randomInteger, randomBoolean } = require('@step-wise/utils')
const { asEquation, expressionComparisons, equationChecks, equationComparisons } = require('@step-wise/cas')

const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasFractionWithinFraction } = equationChecks

// ax = b => x = b/a.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b']

const ansEqualsOptions = ({ switchSides }) => ({ preprocessSide: side => side.cancel(), compareLeft: switchSides ? equivalent : onlyOrderChanges, compareRight: switchSides ? onlyOrderChanges : equivalent })

const metaData = {
	skill: 'moveEquationFactor',
	steps: ['multiplyBothEquationSides', 'cancelFractionFactors'],
	ansEqualsOptions,
	comparison: {
		bothSidesChanged: { compareSide: equivalent },
		ans: (input, correct, solution) => !hasFractionWithinFraction(input) && correct.equals(input, ansEqualsOptions(solution)),
	}
}
addSetupFromSteps(metaData)

function generateState() {
	const a = randomInteger(-8, 8, [-1, 0, 1])
	const b = randomInteger(-8, 8, [-1, 0, 1, a, -a])
	return {
		x: sample(variableSet),
		a, b,
		switchSides: randomBoolean(), // Do we switch equation sides?
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor = variables.a
	const equation = asEquation('a*x=b')[state.switchSides ? 'switch' : 'self']().substitute(variables).removeTrivial()
	const bothSidesChanged = equation.divide(factor)
	const ans = bothSidesChanged[state.switchSides ? 'mapRight' : 'mapLeft'](side => side.cancel())
	const ansCleaned = ans.cancel()
	const isFurtherSimplificationPossible = !equationComparisons.onlyOrderChanges(ans, ansCleaned)
	return { ...state, variables, factor, equation, bothSidesChanged, ans, ansCleaned, isFurtherSimplificationPossible }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'bothSidesChanged')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
