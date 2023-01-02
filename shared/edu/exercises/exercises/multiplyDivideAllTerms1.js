const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { asExpression, Integer, Equation, equationComparisons, equationChecks } = require('../../../CAS')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { onlyElementaryClean, equivalent } = equationComparisons
const { hasSumWithinProduct } = equationChecks

// Multiply "ay/x + bz/y + cz/x + dx/z = 0" by x.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd']

const data = {
	skill: 'multiplyDivideAllTerms',
	steps: [null, 'expandBrackets', 'addRemoveFractionFactors'],
	comparison: {
		default: (input, correct) => onlyElementaryClean(input, correct.removeUseless()),
		intermediateWithBrackets: (input, correct) => onlyElementaryClean(input.removeUseless(), correct.removeUseless()), // This is to avoid "0*x" from being an issue.
		intermediateWithoutBrackets: (input, correct) => !hasSumWithinProduct(input) && equivalent(input, correct),
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
		aLeft: getRandomBoolean(),
		bLeft: getRandomBoolean(),
		cLeft: getRandomBoolean(),
		dLeft: getRandomBoolean(),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)

	// Assemble the equation.
	const terms = ['ay/x', 'bz/y', 'cz/x', 'dx/z'].map(term => asExpression(term).substituteVariables(variables))
	let left = Integer.zero
	let right = Integer.zero
	terms.forEach((term, index) => {
		if (state[`${constants[index]}Left`])
			left = left.add(term)
		else
			right = right.add(term)
	})
	const equation = new Equation(left, right).removeUseless()

	// Set up the solution.
	const intermediateWithBrackets = equation.multiply(variables.x)
	const intermediateWithoutBrackets = intermediateWithBrackets.simplify({ expandProductsOfSums: true, removeUseless: true })
	const intermediateWithXPulledIn = intermediateWithoutBrackets.simplify({ mergeFractionProducts: true, removeUseless: true })
	const ans = intermediateWithXPulledIn.simplify({ removeUseless: true, mergeFractionTerms: true, mergeProductTerms: true, mergeSumNumbers: true })

	return { ...state, variables, terms, equation, intermediateWithBrackets, intermediateWithoutBrackets, intermediateWithXPulledIn, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performComparison('ans', input, solution, data.comparison)
	if (step === 1)
		return performComparison('intermediateWithBrackets', input, solution, data.comparison)
	if (step === 2)
		return performComparison('intermediateWithoutBrackets', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}