const { selectRandomly, getRandomInteger } = require('../../../../../../../util')
const { asExpression, asEquation, expressionComparisons, expressionChecks, equationComparisons } = require('../../../../../../../CAS')
const { and } = require('../../../../../../../skillTracking')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

// ax + wy = b.
// zx + cy = d.
const availableVariableSets = [['a', 'b', 'c', 'd'], ['w', 'x', 'y', 'z'], ['p', 'q', 'r', 's']]
const usedVariables = ['w', 'x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd']

const metaData = {
	skill: 'solveMultiVariableSystemOfLinearEquations',
	steps: ['solveMultiVariableLinearEquation', 'substituteAnExpression', 'solveMultiVariableLinearEquation', and('substituteAnExpression', 'simplifyFractionOfFractionSumsWithMultipleVariables')],
	comparison: {
		eq1Solution: expressionComparisons.equivalent,
		eq2Substituted: equationComparisons.equivalent,
		x: (input, correct) => expressionComparisons.equivalent(input, correct) && !expressionChecks.hasFractionWithinFraction(input),
		y: (input, correct) => expressionComparisons.equivalent(input, correct) && !expressionChecks.hasFractionWithinFraction(input),
	},
}
addSetupFromSteps(metaData)

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
