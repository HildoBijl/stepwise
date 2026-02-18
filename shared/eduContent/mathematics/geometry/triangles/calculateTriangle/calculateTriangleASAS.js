const { selectRandomly, getRandomNumber, getRandomBoolean, getRandomInteger } = require('../../../../../util')
const { asExpression, asEquation, equationComparisons, Integer, Variable } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const variableSet = ['x', 'y', 'z']

const metaData = {
	skill: 'calculateTriangle',
	steps: ['determine2DAngles', null, null, null, 'solveLinearEquation'],
	comparison: {
		default: {},
		equation: (input, correct) => equationComparisons.equivalent(input, correct) || equationComparisons.equivalent(input.invert(), correct),
	},
}
addSetupFromSteps(metaData)

function generateState() {
	// Determine the angles and check if they match the conditions.
	const α = getRandomInteger(5, 12) * 5
	const β = getRandomInteger(5, 24, [18, 18 - α / 5]) * 5 // Ensure there is no 90 degree angle.
	if (α + β > 155)
		return generateState()

	// Gather all data into a state.
	return {
		α: new Integer(α),
		β: new Integer(β),
		a: new Variable(selectRandomly(variableSet)),
		c: new Integer(getRandomInteger(2, 12)),
		rotation: getRandomNumber(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	let { α, β, a, c } = state
	const variables = { α, β, a, c }

	// Determine gamma.
	const γRaw = asExpression('180-α-β').substituteVariables(variables)
	const γ = γRaw.regularClean()
	variables.γ = γ

	// Define solution method data.
	const rule = 0 // Use the sine rule.
	const equation = asEquation('a/sin(α)=c/sin(γ)', { useDegrees: true }).substituteVariables(variables)
	const numSolutions = 1

	// Determine a and b.
	const aRaw = asExpression('c*sin(α)/sin(γ)', { useDegrees: true }).substituteVariables(variables)
	a = aRaw.regularClean()
	const bRaw = asExpression('c*sin(β)/sin(γ)', { useDegrees: true }).substituteVariables(variables)
	const b = bRaw.regularClean()

	return { ...state, variables, γRaw, γ, rule, numSolutions, equation, aRaw, a, bRaw, b }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'γ')
		case 2:
			return performComparison(exerciseData, 'rule')
		case 3:
			return performComparison(exerciseData, 'equation')
		case 4:
			return performComparison(exerciseData, 'numSolutions')
		case 5:
			return performComparison(exerciseData, 'a')
		default:
			return performComparison(exerciseData, ['numSolutions', 'a'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
