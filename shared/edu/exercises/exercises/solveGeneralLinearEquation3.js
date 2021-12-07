const { selectRandomly, getRandomInteger } = require('../../../util/random')
const { asEquation, expressionChecks, equationChecks, simplifyOptions } = require('../../../CAS')
const { combinerAnd } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performCheck } = require('../util/check')

// (ax+x^2/y)/(bx^2) = cz.
const availableVariableSets = [['a', 'b', 'c'], ['w', 'x', 'y'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const data = {
	skill: 'solveGeneralLinearEquation',
	setup: combinerAnd('simplifyFraction', 'multiplyDivideAllTerms', 'solveBasicLinearEquation'),
	steps: ['simplifyFraction', 'multiplyDivideAllTerms', 'solveBasicLinearEquation'],
	check: {
		ans: (input, correct) => !expressionChecks.hasFractionWithinFraction(input) && expressionChecks.equivalent(input, correct),
		simplified: (input, correct) => expressionChecks.onlyOrderChanges(input.right, correct.right) && !expressionChecks.hasFractionWithinFraction(input.left) && expressionChecks.equivalent(input.left, correct.left),
		multiplied: (input, correct, { variables }) => equationChecks.equivalentSides(input, correct) && !equationChecks.hasFraction(input),
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
	const equation = asEquation('(ax+x^2/y)/(bx^2) = cz').substituteVariables(variables).removeUseless()

	// Find the solution.
	const simplified = asEquation('(ay+x)/(bxy) = cz').substituteVariables(variables).removeUseless() // Multiply up/down by y/x.
	const multiplied = simplified.applyToBothSides(side => side.multiplyBy(simplified.left.denominator)).simplify({ ...simplifyOptions.basicClean, mergeFractionTerms: true, expandProductsOfSums: true })
	const shifted = multiplied.subtract(variables.x).basicClean()
	const pulledOut = shifted.applyToRight(side => side.pullOutsideBrackets(variables.x).simplify({ ...simplifyOptions.regularClean, sortSums: false }))
	const bracketFactor = pulledOut.right.terms.find(factor => !variables.x.equals(factor))
	const ans = pulledOut.left.divideBy(bracketFactor)

	return { ...state, variables, equation, simplified, multiplied, shifted, pulledOut, bracketFactor, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performCheck(['ans'], input, solution, data.check)
	if (step === 1)
		return performCheck(['simplified'], input, solution, data.check)
	if (step === 2)
		return performCheck(['multiplied'], input, solution, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}