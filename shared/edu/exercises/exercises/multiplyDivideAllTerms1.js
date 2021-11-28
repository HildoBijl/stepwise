const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { asExpression, Integer, Equation, equationChecks } = require('../../../CAS')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performCheck } = require('../util/check')

const { onlyOrderChanges } = equationChecks

// Multiply "ay/x + bz/y + cz/x + dx/z = 0" by x.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd']

const data = {
	skill: 'multiplyDivideAllTerms',
	steps: [null, 'expandBrackets', 'addRemoveFractionFactors'],
	check: {
		default: (correct, input) => {
			console.log('Comparing correct and input')
			console.log(correct.str)
			console.log(input.str)
			return onlyOrderChanges(correct.removeUseless(), input.simplify({ removeUseless: true, pullMinusBeforeFraction: true, mergeFractionProducts: true }))
		},
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

function getCorrect(state) {
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
	const equation = new Equation(left, right).removeUseless().simplify({ pullMinusBeforeFraction: true })

	// Set up the solution.
	const intermediateWithBrackets = equation.multiplyBy(variables.x)
	const intermediateWithoutBrackets = intermediateWithBrackets.simplify({ expandProductsOfSums: true, removeUseless: true })
	const intermediateWithXPulledIn = intermediateWithoutBrackets.simplify({ mergeFractionProducts: true, pullMinusBeforeFraction: true, removeUseless: true })
	const ans = intermediateWithXPulledIn.simplify({ removeUseless: true, mergeFractionTerms: true, mergeProductTerms: true, mergeSumNumbers: true })

	return { ...state, variables, terms, equation, intermediateWithBrackets, intermediateWithoutBrackets, intermediateWithXPulledIn, ans }
}

function checkInput(state, input, step) {
	const correct = getCorrect(state)
	if (step === 0 || step === 3)
		return performCheck('ans', correct, input, data.check)
	if (step === 1)
		return performCheck('intermediateWithBrackets', correct, input, data.check)
	if (step === 2)
		return performCheck('intermediateWithoutBrackets', correct, input, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getCorrect,
	checkInput,
}