const { selectRandomly, getRandomInteger } = require('../../../util')
const { repeat } = require('../../../skillTracking')
const { asEquation, expressionComparisons, expressionChecks, equationComparisons, equationChecks } = require('../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables } = require('../../../eduTools')
const { performComparison } = require('../util/comparison')

// (y+b)/(x+c) + a/x = z/x.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const data = {
	skill: 'solveGeneralLinearEquation',
	steps: [repeat('multiplyDivideAllTerms', 2), repeat('expandBrackets', 2), 'solveBasicLinearEquation'],
	comparison: {
		ans: (input, correct) => !expressionChecks.hasFractionWithinFraction(input) && expressionComparisons.equivalent(input, correct),
		multiplied: (input, correct) => equationComparisons.equivalentSides(input, correct) && !equationChecks.hasFraction(input), // No fractions left.
		expanded: (input, correct) => equationComparisons.equivalentSides(input, correct) && !equationChecks.hasFraction(input) && !equationChecks.hasSumWithinProduct(input), // No fractions and no unexpanded brackets left.
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
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('(y+b)/(x+c) + a/x = z/x').substituteVariables(variables).removeUseless()

	// Find the solution.
	const factor1 = variables.x
	const factor2 = equation.left.terms[0].denominator
	const factor = factor1.multiply(factor2)
	const multiplied = equation.applyToLeft(side => side.applyToAllTerms(term => term.multiply(factor))).applyToRight(side => side.multiply(factor)).basicClean({ crossOutFractionTerms: true })
	const expanded = multiplied.simplify({ expandProductsOfSums: true, mergeProductNumbers: true })
	const merged = expanded.regularClean({ sortProducts: false })
	const shifted = merged.subtract(expanded.left.terms[3]).subtract(expanded.right.terms[0]).basicClean()
	const pulledOut = shifted.applyToLeft(side => side.pullOutsideBrackets(variables.x))
	const bracketFactor = pulledOut.left.terms.find(factor => !variables.x.equals(factor))
	const ans = pulledOut.right.divide(bracketFactor)

	return { ...state, variables, equation, factor1, factor2, factor, multiplied, expanded, merged, shifted, pulledOut, bracketFactor, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performComparison(['ans'], input, solution, data.comparison)
	if (step === 1)
		return performComparison(['multiplied'], input, solution, data.comparison)
	if (step === 2)
		return performComparison(['expanded'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}