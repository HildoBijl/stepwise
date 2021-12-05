const { selectRandomly, getRandomInteger } = require('../../../util/random')
const { asEquation, expressionChecks, equationChecks, simplifyOptions } = require('../../../CAS')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performCheck } = require('../util/check')

// (y+b)/(x+c) + a/x = z/x.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const data = {
	skill: 'solveGeneralLinearEquation',
	setup: combinerAnd(combinerRepeat('multiplyDivideAllTerms', 2), combinerRepeat('expandBrackets', 2), 'solveBasicLinearEquation'),
	steps: [combinerRepeat('multiplyDivideAllTerms', 2), combinerRepeat('expandBrackets', 2), 'solveBasicLinearEquation'],
	check: {
		ans: expressionChecks.equivalent,
		multiplied: (input, correct) => equationChecks.equivalentSides(input, correct) && !equationChecks.hasFraction(input), // No fractions left.
		expanded: (input, correct) => equationChecks.equivalentSides(input, correct) && !equationChecks.hasFraction(input) && !equationChecks.hasSumWithinProduct(input), // No fractions and expanded brackets left.
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
	const equation = asEquation('(y+b)/(x+c) + a/x = z/x').substituteVariables(variables).removeUseless()

	// Run the solution.
	const factor1 = variables.x
	const factor2 = equation.left.terms[0].denominator
	const factor = factor1.multiplyBy(factor2)
	const multiplied = equation.applyToLeft(side => side.applyToAllTerms(term => term.multiplyBy(factor))).applyToRight(side => side.multiplyBy(factor)).simplify({ ...simplifyOptions.basicClean, mergeFractionTerms: true })
	const expanded = multiplied.simplify({ expandProductsOfSums: true, mergeProductNumbers: true })
	const shifted = expanded.subtract(expanded.left.terms[3]).subtract(expanded.right.terms[0]).basicClean()
	const pulledOut = shifted.applyToLeft(side => side.pullOutsideBrackets(variables.x))
	const bracketFactor = pulledOut.left.terms.find(factor => !variables.x.equals(factor))
	const ans = pulledOut.right.divideBy(bracketFactor)

	return { ...state, variables, equation, factor1, factor2, factor, multiplied, expanded, shifted, pulledOut, bracketFactor, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performCheck(['ans'], input, solution, data.check)
	if (step === 1)
		return performCheck(['multiplied'], input, solution, data.check)
	if (step === 2)
		return performCheck(['expanded'], input, solution, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}