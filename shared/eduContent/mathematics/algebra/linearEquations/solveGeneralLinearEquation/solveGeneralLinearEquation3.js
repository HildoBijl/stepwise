const { selectRandomly, getRandomInteger } = require('../../../../../util')
const { asEquation, expressionComparisons, expressionChecks, equationComparisons, equationChecks } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../eduTools')

// (ax-x^2/y)/(bx^2) = cz.
const availableVariableSets = [['a', 'b', 'c'], ['w', 'x', 'y'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const data = {
	skill: 'solveGeneralLinearEquation',
	steps: ['simplifyFraction', 'multiplyDivideAllTerms', 'solveBasicLinearEquation'],
	comparison: {
		ans: (input, correct) => !expressionChecks.hasFractionWithinFraction(input) && expressionComparisons.equivalent(input, correct),
		simplified: (input, correct) => expressionComparisons.onlyOrderChanges(input.right, correct.right) && !expressionChecks.hasFractionWithinFraction(input.left) && !expressionChecks.hasPower(input.left) && expressionComparisons.equivalent(input.left, correct.left),
		multiplied: (input, correct) => !equationChecks.hasFraction(input) && (equationComparisons.equivalentSides(input, correct) || equationComparisons.equivalentSides(input, correct.applyMinus())),
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
	const equation = asEquation('(ax-x^2/y)/(bx^2) = cz').substituteVariables(variables).removeUseless()

	// Find the solution.
	const simplified = equation.applyToLeft(left => left.cleanForAnalysis({ sortSums: false }))
	const multiplied = simplified.applyToBothSides(side => side.multiply(simplified.left.denominator)).regularClean()
	const shifted = multiplied.subtract(multiplied.left.terms[1]).basicClean()
	const pulledOut = shifted.applyToRight(side => side.pullOutsideBrackets(variables.x).regularClean())
	const bracketFactor = pulledOut.right.terms.find(factor => !variables.x.equals(factor))
	const ans = pulledOut.left.divide(bracketFactor).cleanForAnalysis({ sortSums: false })

	return { ...state, variables, equation, simplified, multiplied, shifted, pulledOut, bracketFactor, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performComparison(['ans'], input, solution, data.comparison)
	if (step === 1)
		return performComparison(['simplified'], input, solution, data.comparison)
	if (step === 2)
		return performComparison(['multiplied'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}