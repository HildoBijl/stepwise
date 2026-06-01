const { sample, randomInteger, randomBoolean } = require('@step-wise/utils')
const { gcd } = require('@step-wise/math-tools')
const { asEquation, expressionComparisons } = require('@step-wise/cas')

const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*x/b = c/d.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd']

const metaData = {
	skill: 'solveProductEquation',
	steps: ['moveEquationFactor', 'simplifyFraction', 'checkEquationSolution'],
	comparison: {
		isolated: { compareSide: equivalent, allowSwitch: true },
		ans: onlyOrderChanges,
		checkLeft: onlyOrderChanges,
		checkRight: onlyOrderChanges,
	}
}
addSetupFromSteps(metaData)

function generateState(example) {
	const a = randomInteger(-8, 8, [-1, 0, 1])
	const b = example ? 1 : randomInteger(-8, 8, [-1, 0, 1, a, -a])
	const c = randomInteger(-8, 8, [-1, 0, 1, a, -a, b, -b])
	const d = randomInteger(-8, 8, [-1, 0, 1, a, -a, b, -b, c, -c])
	return {
		x: sample(variableSet),
		a, b, c, d,
		switchSides: randomBoolean(), // Do we switch equation sides?
	}
}

function getSolution(state) {
	const { switchSides } = state
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('ax/b=c/d')[switchSides ? 'switch' : 'self']().substitute(variables).removeTrivial()
	const isolated = asEquation('x = (cb)/(da)')[switchSides ? 'switch' : 'self']().substitute(variables).flatten()
	const isolatedSolution = isolated[switchSides ? 'left' : 'right']
	const isolatedSolutionSimplified = isolatedSolution.mergeNumbers(['mergeFractionMinuses'], ['mergeFractionNumbers'])
	const fractionGcd = gcd(isolatedSolutionSimplified.numerator.toNumber(), isolatedSolutionSimplified.denominator.toNumber())
	const canSimplifyFraction = (fractionGcd !== 1)
	const ans = isolatedSolution.normalize()
	const equationWithSolution = equation.substitute({ [state.x]: ans })
	const checkLeft = equationWithSolution.left.normalize()
	const checkRight = equationWithSolution.right.normalize()
	const canNumberSideBeSimplified = !onlyOrderChanges(equationWithSolution[switchSides ? 'left' : 'right'], switchSides ? checkLeft : checkRight)
	return { ...state, variables, equation, isolated, isolatedSolution, isolatedSolutionSimplified, fractionGcd, canSimplifyFraction, ans, equationWithSolution, checkLeft, checkRight, canNumberSideBeSimplified }
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
