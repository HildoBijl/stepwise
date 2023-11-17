const { selectRandomly, getRandomInteger } = require('../../../util')
const { asExpression, asEquation, expressionComparisons, equationComparisons } = require('../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables } = require('../../../eduTools')
const { performComparison } = require('../util/comparison')

// ax + wy = b.
// zx + cy = d.
const availableVariableSets = [['a', 'b', 'c', 'd'], ['w', 'x', 'y', 'z'], ['p', 'q', 'r', 's']]
const usedVariables = ['w', 'x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd']

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
	const b = getRandomInteger(-16, 16)
	const c = getRandomInteger(-6, 6, [0, 1])
	const d = getRandomInteger(-16, 16)

	return {
		...selectRandomVariables(variableSet, usedVariables),
		a, b, c, d,
	}
}

function getSolution(state) {
	// Set up the equations.
	const variables = filterVariables(state, usedVariables, constants)
	const eq1 = asEquation('ax + wy = b').substituteVariables(variables).removeUseless()
	const eq2 = asEquation('zx + cy = d').substituteVariables(variables).removeUseless()

	// Solve it step by step.
	const eq1Solution = asExpression('(b - wy)/a').substituteVariables(variables).removeUseless()
	const eq2Substituted = eq2.substitute(variables.x, eq1Solution)
	const eq2SubstitutedStep1 = asEquation('z*(b - wy) + acy = ad').substituteVariables(variables).basicClean()
	const eq2SubstitutedStep2 = asEquation('bz - zwy + acy = ad').substituteVariables(variables).basicClean()
	const eq2SubstitutedStep3 = asEquation('-zwy + acy = ad - bz').substituteVariables(variables).basicClean()
	const eq2SubstitutedStep4 = asEquation('(-zw + ac)*y = ad - bz').substituteVariables(variables).basicClean()
	const y = asExpression('(ad - bz)/(-zw + ac)').substituteVariables(variables).regularClean()
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