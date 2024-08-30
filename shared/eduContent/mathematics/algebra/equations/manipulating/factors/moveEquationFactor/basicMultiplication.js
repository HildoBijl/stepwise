const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../../util')
const { asEquation, expressionComparisons } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

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
	const factor = variables.x
	const equation = asEquation('a=b/x')[state.switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const bothSidesChanged = equation.multiply(factor).removeUseless({ mergeFractionProducts: true })
	const ans = bothSidesChanged.basicClean({ mergeProductFactors: true, crossOutFractionFactors: true })
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
