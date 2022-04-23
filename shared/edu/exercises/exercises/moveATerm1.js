const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { asExpression, Integer, Equation, equationComparisons } = require('../../../CAS')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { onlyOrderChanges } = equationComparisons

// ax + by + cz = 0.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const data = {
	skill: 'moveATerm',
	steps: [null, null],
	comparison: {
		default: onlyOrderChanges,
	},
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(-12, 12, [0]),
		b: getRandomInteger(-12, 12, [0]),
		c: getRandomInteger(-12, 12, [0]),
		xLeft: getRandomBoolean(),
		yLeft: getRandomBoolean(),
		zLeft: getRandomBoolean(),
		toMove: getRandomInteger(0, 2),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const variableToMove = variables[usedVariables[state.toMove]]
	const isLeft = state[`${usedVariables[state.toMove]}Left`]
	const isPositive = state[constants[state.toMove]] > 0

	// Assemble the equation.
	const terms = []
	let left = Integer.zero
	let right = Integer.zero
	usedVariables.map((variable, index) => {
		const term = asExpression(`${constants[index]}${variable}`).substituteVariables(variables)
		terms.push(term)
		if (state[`${variable}Left`])
			left = left.add(term)
		else
			right = right.add(term)
	})
	const equation = new Equation(left, right).removeUseless()

	// Set up the solution.
	const termToMove = terms[state.toMove]
	const termToMoveAbs = isPositive ? termToMove : termToMove.applyMinus().removeUseless()
	const intermediate = equation.applyToBothSides(side => side.subtract(termToMove)).removeUseless()
	const ans = intermediate.basicClean()

	return { ...state, variables, variableToMove, equation, termToMove, isPositive, isLeft, termToMoveAbs, intermediate, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 2)
		return performComparison('ans', input, solution, data.comparison)
	if (step === 1)
		return performComparison('intermediate', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}