const { sample, getRandomInteger } = require('@step-wise/utils')
const { and } = require('@step-wise/skill-setup')
const { asExpression, asEquation, expressionComparisons, expressionChecks, equationComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

// ax + by + cz = d.
// ex + fy + gz = h.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

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
	const eq1 = asEquation('ax + by + cz = d', {eAsConstant: false}).substitute(variables).removeTrivial()
	const eq2 = asEquation('ex + fy + gz = h', {eAsConstant: false}).substitute(variables).removeTrivial()

	// Solve it step by step.
	const eq1Solution = asExpression('(d - by - cz)/a', {eAsConstant: false}).substitute(variables).normalize()
	const eq2Substituted = eq2.substitute(variables.x, eq1Solution)
	const eq2SubstitutedStep1 = asEquation('e*(d - by - cz) + afy + agz = ah', {eAsConstant: false}).substitute(variables).cancel()
	const eq2SubstitutedStep2 = asEquation('ed - eby - ecz + afy + agz = ah', {eAsConstant: false}).substitute(variables).cancel()
	const eq2SubstitutedStep3 = asEquation('-eby + afy = ah - ed + ecz - agz', {eAsConstant: false}).substitute(variables).cancel()
	const eq2SubstitutedStep4 = eq2SubstitutedStep3.combine()
	const y = asExpression('(ah - ed + ecz - agz)/(-eb + af)', {eAsConstant: false}).substitute(variables).normalize()
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
