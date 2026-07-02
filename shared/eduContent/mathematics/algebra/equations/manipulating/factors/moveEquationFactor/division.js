const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { asEquation, expressionComparisons, equationChecks, equationComparisons } = require('@step-wise/cas')

const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasFractionWithinFraction } = equationChecks

// ax = b/c => [..] = b/(c[..]).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const ansEqualsOptions = ({ switchSides }) => ({ preprocessSide: side => side.cancel(), compareLeft: switchSides ? equivalent : onlyOrderChanges, compareRight: switchSides ? onlyOrderChanges : equivalent })

const metaData = {
	skill: 'moveEquationFactor',
	...stepsToSetup(['multiplyBothEquationSides', 'cancelFractionFactors', 'multiplyDivideFractions']),
	ansEqualsOptions,
	comparison: {
		bothSidesChanged: { compareSide: equivalent },
		fractionFactorsCanceled: (input, correct, solution) => correct.equals(input, ansEqualsOptions(solution)),
		ans: (input, correct, solution) => !hasFractionWithinFraction(input) && correct.equals(input, ansEqualsOptions(solution)),
	}
}

function generateState() {
	const a = getRandomInteger(-8, 8, [-1, 0, 1])
	const b = getRandomInteger(-8, 8, [-1, 0, 1, a, -a])
	const c = getRandomInteger(-8, 8, [-1, 0, 1, a, -a, b, -b])
	return {
		x: sample(variableSet),
		a, b, c,
		switchSides: getRandomBoolean(), // Do we switch equation sides?
		type: getRandomInteger(0, 2), // 0 is move a, 1 is move x, 2 is move a and x together.
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor = [variables.a, variables.x, variables.a.multiply(variables.x)][state.type].removeTrivial()
	const equation = asEquation('a*x=b/c')[state.switchSides ? 'switch' : 'self']().substitute(variables).removeTrivial()
	const bothSidesChanged = equation.divide(factor)
	const fractionFactorsCanceled = bothSidesChanged[state.switchSides ? 'mapRight' : 'mapLeft'](side => side.cancel(['mergeFractionNumbers', 'cancelFractionFactors', 'flattenFractions']))
	const ans = fractionFactorsCanceled.removeTrivial(['flattenFractions'])
	const ansCleaned = ans.normalize()
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

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
