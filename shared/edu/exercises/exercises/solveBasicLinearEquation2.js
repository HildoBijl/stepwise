const { selectRandomly, getRandomInteger } = require('../../../util/random')
const { asEquation, expressionComparisons, equationComparisons } = require('../../../CAS')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

// x/y + a = bz + cx.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const data = {
	skill: 'solveBasicLinearEquation',
	setup: combinerAnd(combinerRepeat('moveATerm', 2), 'pullOutOfBrackets', 'multiplyDivideAllTerms'),
	steps: [combinerRepeat('moveATerm', 2), 'pullOutOfBrackets', 'multiplyDivideAllTerms'],
	comparison: {
		ans: expressionComparisons.equivalent, // For the final answer allow equivalent answers.
		default: (input, correct) => equationComparisons.onlyOrderChangesAndSwitch(input, correct) || equationComparisons.onlyOrderChangesAndSwitch(input, correct.applyMinus()), // Allow switches and minus signs.
		pulledOut: (input, correct) => equationComparisons.onlyOrderChangesAndSwitch(input, correct) || equationComparisons.onlyOrderChangesAndSwitch(input, correct.applyToRight(side => side.applyMinus()).applyToLeft(side => side.applyToTerm(1, factor => factor.applyMinus()))), // Allow switches and minus signs inside the brackets.
	},
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(-12, 12, [0]),
		b: getRandomInteger(-12, 12, [0]),
		c: getRandomInteger(-12, 12, [0]),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('x/y + a = bz + cx').substituteVariables(variables).removeUseless()

	// Find the solution.
	const termsMoved = equation.subtract(equation.left.terms[1]).subtract(equation.right.terms[1]).simplify({ cancelSumTerms: true })
	const pulledOut = termsMoved.applyToLeft(left => left.pullOutsideBrackets(variables.x, { flattenFractions: true }))
	const bracketTerm = pulledOut.left.terms.find(factor => !variables.x.equals(factor))
	const ans = termsMoved.right.divideBy(bracketTerm)
	const ansCleaned = ans.multiplyNumDenBy(variables.y).simplify({ expandProductsOfSums: true }).cleanForAnalysis()

	return { ...state, variables, equation, termsMoved, pulledOut, bracketTerm, ans, ansCleaned }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performComparison(['ans'], input, solution, data.comparison)
	if (step === 1)
		return performComparison(['termsMoved'], input, solution, data.comparison)
	if (step === 2)
		return performComparison(['pulledOut'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}