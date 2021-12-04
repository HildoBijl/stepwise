const { selectRandomly, getRandomInteger } = require('../../../util/random')
const { asEquation, expressionChecks, equationChecks } = require('../../../CAS')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performCheck } = require('../util/check')

// (ax+bz)y = cx + d.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd']

const data = {
	skill: 'solveBasicLinearEquation',
	setup: combinerAnd('expandBrackets', combinerRepeat('moveATerm', 2), 'pullOutOfBrackets', 'multiplyDivideAllTerms'),
	steps: ['expandBrackets', combinerRepeat('moveATerm', 2), 'pullOutOfBrackets', 'multiplyDivideAllTerms'],
	check: {
		ans: expressionChecks.equivalent, // For the final answer allow equivalent answers.
		default: (input, correct) => equationChecks.onlyOrderChangesAndSwitch(input, correct) || equationChecks.onlyOrderChangesAndSwitch(input, correct.applyMinus()), // Allow switches and minus signs.
		pulledOut: (input, correct) => equationChecks.onlyOrderChangesAndSwitch(input, correct) || equationChecks.onlyOrderChangesAndSwitch(input, correct.applyToRight(side => side.applyMinus()).applyToLeft(side => side.applyToElement(1, factor => factor.applyMinus()))), // Allow switches and minus signs inside the brackets.
	},
}

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

	// Run the solution.
	const bracketsExpanded = equation.simplify({ expandProductsOfSums: true })
	const termsMoved = bracketsExpanded.subtract(bracketsExpanded.left.terms[1]).subtract(bracketsExpanded.right.terms[0]).simplify({ cancelSumTerms: true })
	const pulledOut = termsMoved.applyToLeft(left => left.pullOutsideBrackets(variables.x))
	const bracketTerm = pulledOut.left.terms.find(factor => !variables.x.equals(factor))
	const ans = termsMoved.right.divideBy(bracketTerm)

	return { ...state, variables, equation, termsMoved, bracketsExpanded, pulledOut, bracketTerm, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 4)
		return performCheck(['ans'], input, solution, data.check)
	if (step === 1)
		return performCheck(['bracketsExpanded'], input, solution, data.check)
	if (step === 2)
		return performCheck(['termsMoved'], input, solution, data.check)
	if (step === 3)
		return performCheck(['pulledOut'], input, solution, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}