const { selectRandomly, getRandomInteger, getRandomBoolean, gcd } = require('../../../../../../../util')
const { asEquation, expressionComparisons } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// a/b = c/(d*x).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd']

const metaData = {
	skill: 'solveProductEquation',
	steps: ['moveEquationFactor', 'moveEquationFactor', 'simplifyFraction', 'checkEquationSolution'],
	comparison: {
		moved: { check: equivalent, allowSwitch: true },
		isolated: { check: equivalent, allowSwitch: true },
		ans: onlyOrderChanges,
		checkLeft: onlyOrderChanges,
		checkRight: onlyOrderChanges,
	}
}

function generateState(example) {
	const a = getRandomInteger(-8, 8, [-1, 0, 1])
	const b = example ? 1 : getRandomInteger(-8, 8, [-1, 0, 1, a, -a])
	const c = getRandomInteger(-8, 8, [-1, 0, 1, a, -a, b, -b])
	const d = example ? 1 : getRandomInteger(-8, 8, [-1, 0, 1, a, -a, b, -b, c, -c])
	return {
		x: selectRandomly(variableSet),
		a, b, c, d,
		switchSides: getRandomBoolean(), // Do we switch equation sides?
	}
}

function getSolution(state) {
	const { switchSides } = state
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('a/b=c/(d*x)')[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const moved = asEquation('a*x/b=c/d')[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const isolated = asEquation('x = (c*b)/(d*a)')[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const isolatedSolution = isolated[switchSides ? 'left' : 'right']
	const isolatedSolutionSimplified = isolatedSolution.basicClean()
	const fractionGcd = gcd(isolatedSolutionSimplified.numerator.number, isolatedSolutionSimplified.denominator.number)
	const canSimplifyFraction = (fractionGcd !== 1)
	const ans = isolatedSolution.regularClean()
	const equationWithSolution = equation.substituteVariables({ [state.x]: ans })
	const checkLeft = equationWithSolution.left.regularClean()
	const checkRight = equationWithSolution.right.regularClean()
	const canNumberSideBeSimplified = !onlyOrderChanges(equationWithSolution[switchSides ? 'right' : 'left'], switchSides ? checkRight : checkLeft)
	return { ...state, variables, equation, moved, isolated, isolatedSolution, isolatedSolutionSimplified, fractionGcd, canSimplifyFraction, ans, equationWithSolution, checkLeft, checkRight, canNumberSideBeSimplified }
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
