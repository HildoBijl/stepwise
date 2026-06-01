const { sample, randomInteger, randomBoolean } = require('@step-wise/utils')
const { asEquation, expressionComparisons } = require('@step-wise/cas')

const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

// a = b/x => ax = b.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b']

const metaData = {
	skill: 'moveEquationFactor',
	steps: ['multiplyBothEquationSides', 'cancelFractionFactors'],
	comparison: {
		bothSidesChanged: { check: expressionComparisons.equivalent },
		ans: {},
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
	const factor = variables.x
	const equation = asEquation('a=b/x')[state.switchSides ? 'switch' : 'self']().substitute(variables).removeTrivial()
	const bothSidesChanged = equation.multiply(factor).removeTrivial(['mergeFractionProducts'])
	const ans = bothSidesChanged.cancel(['mergeProductFactors', 'cancelFractionFactors'])
	return { ...state, variables, factor, equation, bothSidesChanged, ans }
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
