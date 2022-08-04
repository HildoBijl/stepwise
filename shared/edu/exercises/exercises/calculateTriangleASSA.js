const { epsilon, deg2rad } = require('../../../util/numbers')
const { getRandom, getRandomBoolean, getRandomInteger } = require('../../../util/random')
const { combinerAnd } = require('../../../skillTracking')
const { asExpression, asEquation, equationComparisons, Integer, Arcsin } = require('../../../CAS')

const { selectRandomVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performListComparison } = require('../util/comparison')

const variableSet = ['α', 'β', 'γ']

const data = {
	setup: combinerAnd('calculateTriangle', 'determine2DAngles'),
	steps: ['calculateTriangle', 'determine2DAngles'],
	comparison: {
		default: {},
		equation: (input, correct) => equationComparisons.equivalent(input, correct) || equationComparisons.equivalent(input.invert(), correct),
	},
}

function generateState() {
	// Generate numbers and ensure that there are two solutions.
	const α = getRandomInteger(5, 17) * 5
	const c = getRandomInteger(6, 12)
	const a = getRandomInteger(2, c - 1)
	if (a <= c * Math.sin(deg2rad(α)) + epsilon)
		return generateState()

	// Assemble the state.
	return {
		α: new Integer(α),
		...selectRandomVariables(variableSet, ['β', 'γ']),
		a: new Integer(a),
		c: new Integer(c),
		rotation: getRandom(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	let { α, β, γ, a, c } = state
	const variables = { α, β, γ, a, c }

	// Determine γ.
	const rule = 0 // Use the sine rule.
	const equation = asEquation('a/sin(α) = c/sin(γ)', { useDegrees: true }).substituteVariables(variables)
	const intermediateEquation = asEquation('sin(γ) = c/a*sin(α)', { useDegrees: true }).substituteVariables(variables).regularClean()
	const γ1 = new Arcsin(intermediateEquation.right).applySettings({ useDegrees: true })
	const γ2 = new Integer(180).subtract(γ1).regularClean()
	const numSolutions = 2

	// Determine β.
	const β1 = new Integer(180).subtract(α).subtract(γ1).regularClean()
	const β2 = new Integer(180).subtract(α).subtract(γ2).regularClean()

	// Determine corresponding b values.
	const b1 = asExpression('c*cos(α) + sqrt((c*cos(α))^2 - (c^2-a^2))', { useDegrees: true }).substituteVariables(variables)
	const b2 = asExpression('c*cos(α) - sqrt((c*cos(α))^2 - (c^2-a^2))', { useDegrees: true }).substituteVariables(variables)

	return { ...state, variables, rule, equation, intermediateEquation, γ1, γ2, β1, β2, b1, b2, numSolutions }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0)
		return input.numSolutions === solution.numSolutions && performListComparison(['β1', 'β2'], input, solution, data.comparison)
	if (step === 1)
		return input.numSolutions === solution.numSolutions && performListComparison(['γ1', 'γ2'], input, solution, data.comparison)
	if (step === 2)
		return performListComparison(['β1', 'β2'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}