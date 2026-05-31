const { sample, randomInteger, randomBoolean } = require('@step-wise/utils')
const { asEquation, expressionComparisons, equationChecks, equationComparisons } = require('@step-wise/cas')

const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasFractionWithinFraction } = equationChecks

// a = b/(cx) => a[..] = b/[..].
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const ansEqualsOptions = ({ switchSides }) => ({ preprocessSide: side => side.cancel({ flattenFractions: false }), compareLeft: switchSides ? equivalent : onlyOrderChanges, compareRight: switchSides ? onlyOrderChanges : equivalent })

const metaData = {
	skill: 'moveEquationFactor',
	steps: ['multiplyBothEquationSides', 'cancelFractionFactors'],
	ansEqualsOptions,
	comparison: {
		bothSidesChanged: { check: equivalent },
		ans: (input, correct, solution) => !hasFractionWithinFraction(input) && correct.equals(input, ansEqualsOptions(solution)),
	}
}
addSetupFromSteps(metaData)

function generateState() {
	const a = randomInteger(-8, 8, [-1, 0, 1])
	const b = randomInteger(-8, 8, [-1, 0, 1, a, -a])
	const c = randomInteger(-8, 8, [-1, 0, 1, a, -a, b, -b])
	return {
		x: sample(variableSet),
		a, b, c,
		switchSides: randomBoolean(), // Do we switch equation sides?
		type: randomInteger(0, 2), // 0 is move c, 1 is move x, 2 is move c and x together.
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor = [variables.c, variables.x, variables.c.multiply(variables.x)][state.type]
	const equation = asEquation('a=b/(c*x)')[state.switchSides ? 'switch' : 'self']().substitute(variables).removeTrivial()
	const bothSidesChanged = equation.multiply(factor).removeTrivial({ mergeFractionProducts: true })
	const ans = bothSidesChanged[state.switchSides ? 'mapLeft' : 'mapRight'](side => side.cancel({ mergeFractionNumbers: state.type !== 1, cancelFractionFactors: true }))
	const ansCleaned = ans.cancel({ mergeFractionNumbers: true })
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
