const { selectRandomly, getRandomInteger } = require('../../../util')
const { repeat } = require('../../../skillTracking')
const { asEquation, expressionComparisons, equationComparisons } = require('../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../eduTools')

// (ax+bz)y = cx + d.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd']

const data = {
	skill: 'solveBasicLinearEquation',
	steps: ['expandBrackets', repeat('moveATerm', 2), 'pullOutOfBrackets', 'multiplyDivideAllTerms'],
	comparison: {
		ans: expressionComparisons.equivalent, // For the final answer allow equivalent answers.
		default: (input, correct) => equationComparisons.onlyOrderChangesAndSwitch(input, correct) || equationComparisons.onlyOrderChangesAndSwitch(input, correct.applyMinus()), // Allow switches and minus signs.
		pulledOut: (input, correct) => equationComparisons.onlyOrderChangesAndSwitch(input, correct) || equationComparisons.onlyOrderChangesAndSwitch(input, correct.applyToRight(side => side.applyMinus()).applyToLeft(side => side.applyToTerm(1, factor => factor.applyMinus()))), // Allow switches and minus signs inside the brackets.
	},
}
addSetupFromSteps(data)

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(-12, 12, [0]),
		b: getRandomInteger(-12, 12, [0]),
		c: getRandomInteger(-12, 12, [0]),
		d: getRandomInteger(-12, 12, [0]),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('(ax+bz)y = cx + d').substituteVariables(variables).removeUseless()

	// Find the solution.
	const bracketsExpanded = equation.simplify({ expandProductsOfSums: true })
	const termsMoved = bracketsExpanded.subtract(bracketsExpanded.left.terms[1]).subtract(bracketsExpanded.right.terms[0]).simplify({ cancelSumTerms: true })
	const pulledOut = termsMoved.applyToLeft(left => left.pullOutsideBrackets(variables.x))
	const bracketTerm = pulledOut.left.terms.find(factor => !variables.x.equals(factor))
	const ans = termsMoved.right.divide(bracketTerm)

	return { ...state, variables, equation, termsMoved, bracketsExpanded, pulledOut, bracketTerm, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 4)
		return performComparison(['ans'], input, solution, data.comparison)
	if (step === 1)
		return performComparison(['bracketsExpanded'], input, solution, data.comparison)
	if (step === 2)
		return performComparison(['termsMoved'], input, solution, data.comparison)
	if (step === 3)
		return performComparison(['pulledOut'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}