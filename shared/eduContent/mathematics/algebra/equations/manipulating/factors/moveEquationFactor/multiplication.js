const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../../util')
const { asEquation, expressionComparisons, equationChecks, equationComparisons } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasFractionWithinFraction } = equationChecks

// a = b/(cx) => a[..] = b/[..].
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

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
	const c = getRandomInteger(-8, 8, [-1, 0, 1, a, -a, b, -b])
	return {
		x: selectRandomly(variableSet),
		a, b, c,
		switchSides: getRandomBoolean(), // Do we switch equation sides?
		type: getRandomInteger(0, 2), // 0 is move c, 1 is move x, 2 is move c and x together.
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor = [variables.c, variables.x, variables.c.multiply(variables.x)][state.type]
	const equation = asEquation('a=b/(c*x)')[state.switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const bothSidesChanged = equation.multiply(factor).removeUseless({ mergeFractionProducts: true })
	const ans = bothSidesChanged[state.switchSides ? 'applyToLeft' : 'applyToRight'](side => side.basicClean({ crossOutFractionNumbers: state.type !== 1, crossOutFractionFactors: true }))
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
