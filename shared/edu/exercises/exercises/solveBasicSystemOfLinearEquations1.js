const { selectRandomly, getRandomInteger } = require('../../../util/random')
const { asExpression, asEquation, expressionComparisons, equationComparisons } = require('../../../CAS')
const { combinerRepeat } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

// ax + by = c.
// dx + ey = f.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
const constants = ['a', 'b', 'c', 'd', 'e', 'f']

const data = {
	skill: 'solveBasicSystemOfLinearEquations',
	setup: combinerRepeat('solveBasicLinearEquation', 2),
	steps: ['solveBasicLinearEquation', null, 'solveBasicLinearEquation', null],
	comparison: {
		default: {},
		eq1Solution: expressionComparisons.equivalent,
		eq2Substituted: equationComparisons.equivalent,
	},
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	const x = getRandomInteger(-8, 8, [0])
	const y = getRandomInteger(-8, 8, [0])
	const a = getRandomInteger(-8, 8, [0])
	const b = getRandomInteger(-8, 8, [0])
	const d = getRandomInteger(-8, 8, [0])
	const e = getRandomInteger(-8, 8, [0])

	// On a non-invertible system, redo the generation.
	if (a * e - b * d === 0)
		return generateState()

	// Set up state.
	const c = a * x + b * y
	const f = d * x + e * y
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a, b, c, d, e, f,
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const eq1 = asEquation('ax + by = c').substituteVariables(variables).removeUseless()
	const eq2 = asEquation('dx + ey = f').substituteVariables(variables).removeUseless()

	// Solve the steps.
	const eq1Solution = asExpression('(c-b*y)/a').substituteVariables(variables).removeUseless()
	const eq2Substituted = eq2.substitute(variables.x, eq1Solution)
	const eq2SubstitutedStep1 = asEquation('d*(c-b*y)+a*e*y=a*f').substituteVariables(variables).removeUseless()
	const eq2SubstitutedStep2 = asEquation('d*c-d*b*y+a*e*y=a*f').substituteVariables(variables).basicClean()
	const eq2SubstitutedStep3 = asEquation('-d*b*y+a*e*y=a*f-d*c').substituteVariables(variables).regularClean()
	const eq2SubstitutedStep4 = asExpression('a*f-d*c').substituteVariables(variables).basicClean().divide(asExpression('a*e-d*b').substituteVariables(variables).basicClean())

	// Find the solution.
	const { a, b, c, d, e, f } = variables
	const x = (b * f - e * c) / (b * d - a * e)
	const y = (a * f - d * c) / (a * e - b * d)
	return { ...state, variables, eq1, eq2, eq1Solution, eq2Substituted, eq2SubstitutedStep1, eq2SubstitutedStep2, eq2SubstitutedStep3, eq2SubstitutedStep4, x, y }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0)
		return performComparison(['x', 'y'], input, solution, data.comparison)
	if (step === 1)
		return performComparison(['eq1Solution'], input, solution, data.comparison)
	if (step === 2)
		return performComparison(['eq2Substituted'], input, solution, data.comparison)
	if (step === 3)
		return performComparison(['y'], input, solution, data.comparison)
	if (step === 4)
		return performComparison(['x'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}