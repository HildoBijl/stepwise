const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../../util')
const { asEquation, expressionComparisons, equationChecks, equationComparisons } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasFractionWithinFraction } = equationChecks

// ax = b/c => [..] = b/(c[..]).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const ansEqualsOptions = ({ switchSides }) => ({ preprocess: side => side.basicClean({ flattenFractions: false }), leftCheck: switchSides ? equivalent : onlyOrderChanges, rightCheck: switchSides ? onlyOrderChanges : equivalent })

const metaData = {
	skill: 'moveEquationFactor',
	steps: ['multiplyBothEquationSides', 'cancelFractionFactors', 'multiplyDivideFractions'],
	ansEqualsOptions,
	comparison: {
		bothSidesChanged: { check: equivalent },
		fractionFactorsCanceled: (input, correct, solution) => correct.equals(input, ansEqualsOptions(solution)),
		ans: (input, correct, solution) => !hasFractionWithinFraction(input) && correct.equals(input, ansEqualsOptions(solution)),
	}
}
addSetupFromSteps(metaData)

function generateState() {
	const a = getRandomInteger(-8, 8, [-1, 0, 1])
	const b = getRandomInteger(-8, 8, [-1, 0, 1, a, -a])
	const c = getRandomInteger(-8, 8, [-1, 0, 1, a, -a, b, -b])
	return {
		x: selectRandomly(variableSet),
		a, b, c,
		switchSides: getRandomBoolean(), // Do we switch equation sides?
		type: getRandomInteger(0, 2), // 0 is move a, 1 is move x, 2 is move a and x together.
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor = [variables.a, variables.x, variables.a.multiply(variables.x)][state.type]
	const equation = asEquation('a*x=b/c')[state.switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const bothSidesChanged = equation.divide(factor)
	const fractionFactorsCanceled = bothSidesChanged[state.switchSides ? 'applyToRight' : 'applyToLeft'](side => side.basicClean({ crossOutFractionNumbers: true, crossOutFractionFactors: true, flattenFractions: false }))
	const ans = fractionFactorsCanceled.removeUseless({ flattenFractions: true })
	const ansCleaned = ans.basicClean({ crossOutFractionNumbers: true })
	const isFurtherSimplificationPossible = !equationComparisons.onlyOrderChanges(ans, ansCleaned)
	return { ...state, variables, factor, equation, bothSidesChanged, fractionFactorsCanceled, ans, ansCleaned, isFurtherSimplificationPossible }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'bothSidesChanged')
		case 2:
			return performComparison(exerciseData, 'fractionFactorsCanceled')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
