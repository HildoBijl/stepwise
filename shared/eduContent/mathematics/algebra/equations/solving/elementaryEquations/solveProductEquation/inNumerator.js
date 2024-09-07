const { selectRandomly, getRandomInteger, getRandomBoolean, gcd } = require('../../../../../../../util')
const { asEquation, expressionComparisons, equationChecks } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasFractionWithinFraction } = equationChecks

// a*x/b = c/d.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd']

const ansEqualsOptions = ({ switchSides }) => ({ preprocess: side => side.basicClean({ flattenFractions: false }), leftCheck: switchSides ? equivalent : onlyOrderChanges, rightCheck: switchSides ? onlyOrderChanges : equivalent })

const metaData = {
	skill: 'solveProductEquation',
	steps: ['moveEquationFactor', 'simplifyFractionOfFractions', 'checkEquationSolution'],
	ansEqualsOptions,
	comparison: {
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
	const d = getRandomInteger(-8, 8, [-1, 0, 1, a, -a, b, -b, c, -c])
	return {
		x: selectRandomly(variableSet),
		a, b, c, d,
		switchSides: getRandomBoolean(), // Do we switch equation sides?
	}
}

function getSolution(state) {
	const { switchSides } = state
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('a*x/b=c/d')[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const isolated = asEquation('x = (c*b)/(d*a)')[switchSides ? 'switch' : 'self']().substituteVariables(variables).removeUseless()
	const isolatedSolution = isolated[switchSides ? 'left' : 'right']
	const isolatedSolutionSimplified = isolatedSolution.basicClean()
	const fractionGcd = gcd(isolatedSolutionSimplified.numerator.number, isolatedSolutionSimplified.denominator.number)
	const ans = isolatedSolution.regularClean()
	const equationWithSolution = equation.substituteVariables({ [state.x]: ans })
	const checkLeft = equationWithSolution.left.regularClean()
	const checkRight = equationWithSolution.right.regularClean()
	const canNumberSideBeSimplified = !onlyOrderChanges(equationWithSolution[switchSides ? 'left' : 'right'], switchSides ? checkLeft : checkRight)
	return { ...state, variables, equation, isolated, isolatedSolution, isolatedSolutionSimplified, fractionGcd, ans, equationWithSolution, checkLeft, checkRight, canNumberSideBeSimplified }
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
