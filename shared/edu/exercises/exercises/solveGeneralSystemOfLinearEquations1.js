const { selectRandomly, getRandomInteger } = require('../../../util')
const { asExpression, asEquation, expressionComparisons, equationComparisons } = require('../../../CAS')

const { selectRandomVariables, filterVariables } = require('../../../eduTools')
const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

// ax + by + cz = d.
// ex + fy + gz = h.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

const data = {
	skill: 'solveGeneralSystemOfLinearEquations',
	steps: ['solveBasicLinearEquation', null, 'solveGeneralLinearEquation', null],
	comparison: {
		eq1Solution: expressionComparisons.equivalent,
		eq2Substituted: equationComparisons.equivalent,
		x: expressionComparisons.equivalent,
		y: expressionComparisons.equivalent,
	},
}
addSetupFromSteps(data)

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	const a = getRandomInteger(-6, 6, [0, 1])
	const b = getRandomInteger(-6, 6, [0, 1])
	const c = getRandomInteger(-6, 6, [0, 1])
	const d = getRandomInteger(-16, 16)
	const e = getRandomInteger(-6, 6, [0, 1])
	const f = getRandomInteger(-6, 6, [0, 1])
	const g = getRandomInteger(-6, 6, [0, 1])
	const h = getRandomInteger(-16, 16)

	// On a non-invertible system, redo the generation.
	if (a * f - b * e === 0)
		return generateState()

	return {
		...selectRandomVariables(variableSet, usedVariables),
		a, b, c, d, e, f, g, h,
	}
}

function getSolution(state) {
	// Set up the equations.
	const variables = filterVariables(state, usedVariables, constants)
	const eq1 = asEquation('ax + by + cz = d').substituteVariables(variables).removeUseless()
	const eq2 = asEquation('ex + fy + gz = h').substituteVariables(variables).removeUseless()

	// Solve it step by step.
	const eq1Solution = asExpression('(d - by - cz)/a').substituteVariables(variables).removeUseless()
	const eq2Substituted = eq2.substitute(variables.x, eq1Solution)
	const eq2SubstitutedStep1 = asEquation('e*(d - by - cz) + afy + agz = ah').substituteVariables(variables).basicClean()
	const eq2SubstitutedStep2 = asEquation('ed - eby - ecz + afy + agz = ah').substituteVariables(variables).basicClean()
	const eq2SubstitutedStep3 = asEquation('-eby + afy = ah - ed + ecz - agz').substituteVariables(variables).basicClean()
	const eq2SubstitutedStep4 = eq2SubstitutedStep3.regularClean()
	const y = asExpression('(ah - ed + ecz - agz)/(-eb + af)').substituteVariables(variables).regularClean()
	const xRaw = eq1Solution.substitute(variables.y, y)
	const x = xRaw.cleanForAnalysis()

	// Find the solution.
	return { ...state, variables, eq1, eq2, eq1Solution, eq2Substituted, eq2SubstitutedStep1, eq2SubstitutedStep2, eq2SubstitutedStep3, eq2SubstitutedStep4, x, xRaw, y }
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