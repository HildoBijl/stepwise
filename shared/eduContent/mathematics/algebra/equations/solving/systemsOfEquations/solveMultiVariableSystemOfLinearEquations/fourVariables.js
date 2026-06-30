const { sample, getRandomInteger } = require('@step-wise/utils')
const { and } = require('@step-wise/skill-setup')
const { asExpression, asEquation, expressionComparisons, expressionChecks, equationComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

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
	const variableSet = sample(availableVariableSets)
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
	const eq1 = asEquation('ax + wy = b').substitute(variables).removeTrivial()
	const eq2 = asEquation('zx + cy = d').substitute(variables).removeTrivial()

	// Solve it step by step.
	const eq1Solution = asExpression('(b - wy)/a').substitute(variables).normalize()
	const eq2Substituted = eq2.substitute(variables.x, eq1Solution)
	const eq2SubstitutedStep1 = asEquation('z*(b - wy) + acy = ad').substitute(variables).cancel()
	const eq2SubstitutedStep2 = asEquation('bz - zwy + acy = ad').substitute(variables).cancel()
	const eq2SubstitutedStep3 = asEquation('-zwy + acy = ad - bz').substitute(variables).cancel()
	const eq2SubstitutedStep4 = asEquation('(-zw + ac)*y = ad - bz').substitute(variables).cancel()
	const y = asExpression('(ad - bz)/(-zw + ac)').substitute(variables).normalize()
	const xRaw = eq1Solution.substitute(variables.y, y)
	const x = xRaw.normalize()

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

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
