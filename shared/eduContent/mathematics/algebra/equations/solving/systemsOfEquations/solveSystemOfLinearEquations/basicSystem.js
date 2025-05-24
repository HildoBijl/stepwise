const { selectRandomly, getRandomInteger } = require('../../../../../../../util')
const { Integer, asExpression, asEquation, expressionComparisons, equationComparisons } = require('../../../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

// ax + by = c.
// dx + ey = f.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
const constants = ['a', 'b', 'c', 'd', 'e', 'f']

const metaData = {
	skill: 'solveSystemOfLinearEquations',
	steps: ['solveMultiVariableLinearEquation', 'substituteAnExpression', 'solveLinearEquation', 'substituteANumber'],
	comparison: {
		default: expressionComparisons.onlyOrderChanges,
		eq1Solution: expressionComparisons.equivalent,
		eq2Substituted: equationComparisons.equivalent,
	},
}
addSetupFromSteps(metaData)

function generateState(example) {
	const variableSet = selectRandomly(availableVariableSets)
	const x = getRandomInteger(example ? -8 : -12, example ? 8 : 12, [0])
	const y = getRandomInteger(example ? -8 : -12, example ? 8 : 12, [0])
	const a = getRandomInteger(example ? -8 : -12, example ? 8 : 12, [0])
	const b = getRandomInteger(example ? -8 : -12, example ? 8 : 12, [0])
	const d = getRandomInteger(example ? -8 : -12, example ? 8 : 12, [0])
	const e = getRandomInteger(example ? -8 : -12, example ? 8 : 12, [0])

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
	const x = new Integer((b * f - e * c) / (b * d - a * e))
	const y = new Integer((a * f - d * c) / (a * e - b * d))
	return { ...state, variables, eq1, eq2, eq1Solution, eq2Substituted, eq2SubstitutedStep1, eq2SubstitutedStep2, eq2SubstitutedStep3, eq2SubstitutedStep4, x, y }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'eq1Solution')
		case 2:
			return performComparison(exerciseData, 'eq2Substituted')
		case 3:
			return performComparison(exerciseData, 'y')
		case 4:
			return performComparison(exerciseData, 'x')
		default:
			return performComparison(exerciseData, ['x', 'y'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
