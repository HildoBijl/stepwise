const { selectRandomly, getRandomInteger } = require('../../../util/random')
const { asEquation, expressionChecks, equationChecks, simplifyOptions } = require('../../../CAS')
const { combinerAnd } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performCheck } = require('../util/check')

// 1/(a/w+b/x) = y/z.
const availableVariableSets = [['a', 'b', 'c', 'd'], ['w', 'x', 'y', 'z'], ['p', 'q', 'r', 's']]
const usedVariables = ['w', 'x', 'y', 'z']
const constants = ['a', 'b']

const data = {
	skill: 'solveGeneralLinearEquation',
	setup: combinerAnd('simplifyFraction', 'multiplyDivideAllTerms', 'expandBrackets', 'solveBasicLinearEquation'),
	steps: ['simplifyFraction', 'multiplyDivideAllTerms', 'expandBrackets', 'solveBasicLinearEquation'],
	check: {
		ans: (input, correct) => !expressionChecks.hasFractionWithinFraction(input) && expressionChecks.equivalent(input, correct),
		simplified: (input, correct) => expressionChecks.onlyOrderChanges(input.right, correct.right) && !expressionChecks.hasFractionWithinFraction(input.left) && expressionChecks.equivalent(input.left, correct.left),
		multiplied: (input, correct, { variables }) => equationChecks.equivalentSides(input, correct) && !equationChecks.hasFraction(input), // No fractions.
		expanded: (input, correct) => equationChecks.equivalentSides(input, correct) && !equationChecks.hasFraction(input) && !equationChecks.hasSumWithinProduct(input), // No fractions and no unexpanded brackets left.
	},
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(-12, 12, [0]),
		b: getRandomInteger(-12, 12, [0]),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('1/(a/w+b/x) = y/z').substituteVariables(variables).removeUseless()

	// Find the solution.
	const simplified = equation.applyToLeft(side => side.cleanForAnalysis({ sortSums: false }))
	const multiplied = simplified.applyToBothSides(side => side.multiplyBy(simplified.left.denominator).multiplyBy(simplified.right.denominator)).regularClean()
	const expanded = multiplied.simplify({ expandProductsOfSums: true, splitFractions: true, mergeProductNumbers: true })
	const termToMove = expanded.right.terms.find(term => term.dependsOn(variables.x))
	const shifted = expanded.subtract(termToMove).regularClean()
	const pulledOut = shifted.applyToLeft(side => side.pullOutsideBrackets(variables.x).regularClean())
	const bracketFactor = pulledOut.left.terms.find(factor => !variables.x.equals(factor))
	const ans = pulledOut.right.divideBy(bracketFactor).cleanForAnalysis({ sortSums: false })

	return { ...state, variables, equation, simplified, multiplied, expanded, termToMove, shifted, pulledOut, bracketFactor, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 4)
		return performCheck(['ans'], input, solution, data.check)
	if (step === 1)
		return performCheck(['simplified'], input, solution, data.check)
	if (step === 2)
		return performCheck(['multiplied'], input, solution, data.check)
	if (step === 3)
		return performCheck(['expanded'], input, solution, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}