const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { gcd } = require('@step-wise/math-tools')
const { asExpression, asEquation, expressionComparisons } = require('@step-wise/cas')

const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// (axy)/(bz) = cz.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'solveMultiVariableProductEquation',
	steps: ['moveEquationFactor', 'simplifyFractionWithVariables', 'checkMultiVariableEquationSolution'],
	comparison: {
		isolated: { compareSide: equivalent, allowSwitch: true },
		ans: onlyOrderChanges,
		checkLeft: onlyOrderChanges,
		checkRight: onlyOrderChanges,
	}
}
addSetupFromSteps(metaData)

function generateState(example) {
	const variableSet = sample(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: example ? 1 : getRandomInteger(-12, 12, [0]),
		b: example ? 1 : getRandomInteger(1, 12, [0]),
		c: getRandomInteger(-12, 12, [0]),
		switchSides: getRandomBoolean(),
	}
}

function getSolution(state) {
	const { x, a, b, c, switchSides } = state
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('(a*x*y)/(b*z) = c*z')[switchSides ? 'switch' : 'self']().substitute(variables).removeTrivial()
	const factor1 = asExpression('b*z').substitute(variables).removeTrivial()
	const factor2 = asExpression('a*y').substitute(variables).removeTrivial()
	const isolated = asEquation('x = (c*z*b*z)/(a*y)')[switchSides ? 'switch' : 'self']().substitute(variables).removeTrivial()
	const isolatedSolution = isolated[switchSides ? 'left' : 'right']
	const fractionGcd = gcd(a, b * c)
	const canSimplifyFraction = (fractionGcd !== 1)
	const ans = isolatedSolution.combine()
	const equationWithSolution = equation.substitute({ [x]: ans })
	const equationWithSolutionCleaned = equationWithSolution.combine()
	const checkLeft = equationWithSolution.left.combine()
	const checkRight = equationWithSolution.right.combine()
	return { ...state, variables, equation, factor1, factor2, isolated, isolatedSolution, canSimplifyFraction, ans, equationWithSolution, equationWithSolutionCleaned, checkLeft, checkRight }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'isolated')
		case 3:
			return performComparison(exerciseData, ['checkLeft', 'checkRight'])
		default:
			return performComparison(exerciseData, 'ans')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
