const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../../util')
const { asEquation, expressionComparisons, equationChecks, equationComparisons } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasFractionWithinFraction } = equationChecks

// ax = b => x = b/a.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b']

const ansEqualsOptions = ({ switchSides }) => ({ preprocess: side => side.basicClean({ flattenFractions: false }), leftCheck: switchSides ? equivalent : onlyOrderChanges, rightCheck: switchSides ? onlyOrderChanges : equivalent })

const metaData = {
	skill: 'moveEquationFactor',
	steps: ['multiplyBothEquationSides', 'cancelFractionFactors'],
	ansEqualsOptions,
	comparison: {
		bothSidesChanged: { check: equivalent },
		ans: (input, correct, solution) => !hasFractionWithinFraction(input) && correct.equals(input, ansEqualsOptions(solution)),
	}
}

function generateState() {
	const a = getRandomInteger(-8, 8, [-1, 0, 1])
	const b = getRandomInteger(-8, 8, [-1, 0, 1, a, -a])
	return {
		x: selectRandomly(variableSet),
		a, b,
		switchSides: getRandomBoolean(), // Do we switch equation sides?
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor = variables.a
	const equation = asEquation('a*x=b')[state.switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const bothSidesChanged = equation.divide(factor)
	const ans = bothSidesChanged[state.switchSides ? 'applyToRight' : 'applyToLeft'](side => side.basicClean({ crossOutFractionNumbers: true }))
	const ansCleaned = ans.basicClean({ crossOutFractionNumbers: true })
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
