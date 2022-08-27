const { selectRandomly, getRandom, getRandomBoolean, getRandomInteger } = require('../../../util/random')
const { combinerAnd } = require('../../../skillTracking')
const { asExpression, asEquation, equationComparisons, Integer, Variable } = require('../../../CAS')

const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const variableSet = ['x', 'y', 'z']

const data = {
	skill: 'calculateTriangle',
	setup: combinerAnd('determine2DAngles', 'solveBasicLinearEquation'),
	steps: ['determine2DAngles', null, null, null, 'solveBasicLinearEquation'],
	comparison: {
		default: {},
		equation: (input, correct) => equationComparisons.equivalent(input, correct) || equationComparisons.equivalent(input.invert(), correct),
	},
}

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
		rotation: getRandom(0, 2 * Math.PI),
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

	return { ...state, γRaw, γ, rule, numSolutions, equation, aRaw, a, bRaw, b }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0)
		return input.numSolutions === solution.numSolutions && performComparison('a', input, solution, data.comparison)
		if (step === 1)
		return performComparison('γ', input, solution, data.comparison)
		if (step === 2)
		return performComparison('rule', input, solution, data.comparison)
		if (step === 3)
		return performComparison('equation', input, solution, data.comparison)
		if (step === 4)
		return performComparison('numSolutions', input, solution, data.comparison)
		if (step === 5)
			return performComparison('a', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}