const { selectRandomly, getRandomInteger, getRandomBoolean, gcd } = require('../../../../../../../util')
const { asExpression, asEquation, expressionComparisons } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// (axy)/(bz) = cz.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'solveMultiVariableProductEquation',
	steps: ['moveEquationFactor', 'simplifyFractionWithVariables', 'checkMultiVariableEquationSolution'],
	comparison: {
		isolated: { check: equivalent, allowSwitch: true },
		ans: onlyOrderChanges,
		checkLeft: onlyOrderChanges,
		checkRight: onlyOrderChanges,
	}
}

function generateState(example) {
	const variableSet = selectRandomly(availableVariableSets)
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
	const equation = asEquation('(a*x*y)/(b*z) = c*z')[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const factor1 = asExpression('b*z').substituteVariables(variables).removeUseless()
	const factor2 = asExpression('a*y').substituteVariables(variables).removeUseless()
	const isolated = asEquation('x = (c*z*b*z)/(a*y)')[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const isolatedSolution = isolated[switchSides ? 'left' : 'right']
	const fractionGcd = gcd(a, b * c)
	const canSimplifyFraction = (fractionGcd !== 1)
	const ans = isolatedSolution.regularClean()
	const equationWithSolution = equation.substituteVariables({ [x]: ans })
	const equationWithSolutionCleaned = equationWithSolution.regularClean()
	const checkLeft = equationWithSolution.left.regularClean()
	const checkRight = equationWithSolution.right.regularClean()
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
