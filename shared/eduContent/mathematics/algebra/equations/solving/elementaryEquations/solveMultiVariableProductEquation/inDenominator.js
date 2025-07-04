const { selectRandomly, getRandomInteger, getRandomBoolean, gcd } = require('../../../../../../../util')
const { asEquation, expressionComparisons } = require('../../../../../../../CAS')

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
		moved: { check: equivalent, allowSwitch: true },
		isolated: { check: equivalent, allowSwitch: true },
		ans: onlyOrderChanges,
		checkLeft: onlyOrderChanges,
		checkRight: onlyOrderChanges,
	}
}
addSetupFromSteps(metaData)

function generateState(example) {
	const variableSet = selectRandomly(availableVariableSets)
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
	const equation = asEquation('(a*y)/(b*x) = c*z')[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const factor = equation[switchSides ? 'left' : 'right']
	const moved = asEquation('(a*y)/b = c*z*x')[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const isolated = asEquation('(a*y)/(b*c*z) = x')[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const isolatedSolution = isolated[switchSides ? 'right' : 'left']
	const fractionGcd = gcd(a, b * c)
	const canSimplifyFraction = (fractionGcd !== 1)
	const ans = isolatedSolution.regularClean()
	const equationWithSolution = equation.substituteVariables({ [x]: ans })
	const equationWithSolutionCleaned = equationWithSolution.regularClean()
	const checkLeft = equationWithSolution.left.regularClean()
	const checkRight = equationWithSolution.right.regularClean()
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
