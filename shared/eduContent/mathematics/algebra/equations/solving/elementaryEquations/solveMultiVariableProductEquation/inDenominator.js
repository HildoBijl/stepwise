const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { gcd } = require('@step-wise/math-tools')
const { asEquation, expressionComparisons } = require('@step-wise/cas')

const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// (ay)/(bx) = cz.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'solveMultiVariableProductEquation',
	steps: ['moveEquationFactor', 'moveEquationFactor', 'simplifyFractionWithVariables', 'checkMultiVariableEquationSolution'],
	comparison: {
		moved: { compareSide: equivalent, allowSwitch: true },
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
		a: getRandomInteger(-12, 12, [0]),
		b: example ? 1 : getRandomInteger(1, 12, [0]),
		c: getRandomInteger(-12, 12, [0]),
		switchSides: getRandomBoolean(),
	}
}

function getSolution(state) {
	const { x, a, b, c, switchSides } = state
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('(a*y)/(b*x) = c*z')[switchSides ? 'switch' : 'self']().substitute(variables).removeTrivial()
	const factor = equation[switchSides ? 'left' : 'right']
	const moved = asEquation('(a*y)/b = c*z*x')[switchSides ? 'switch' : 'self']().substitute(variables).removeTrivial()
	const isolated = asEquation('(a*y)/(b*c*z) = x')[switchSides ? 'switch' : 'self']().substitute(variables).removeTrivial()
	const isolatedSolution = isolated[switchSides ? 'right' : 'left']
	const fractionGcd = gcd(a, b * c)
	const canSimplifyFraction = (fractionGcd !== 1)
	const ans = isolatedSolution.combine()
	const equationWithSolution = equation.substitute({ [x]: ans })
	const equationWithSolutionCleaned = equationWithSolution.combine()
	const checkLeft = equationWithSolution.left.combine()
	const checkRight = equationWithSolution.right.combine()
	return { ...state, variables, equation, factor, moved, isolated, isolatedSolution, fractionGcd, canSimplifyFraction, ans, equationWithSolution, equationWithSolutionCleaned, checkLeft, checkRight }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'moved')
		case 2:
			return performComparison(exerciseData, 'isolated')
		case 4:
			return performComparison(exerciseData, ['checkLeft', 'checkRight'])
		default:
			return performComparison(exerciseData, 'ans')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
