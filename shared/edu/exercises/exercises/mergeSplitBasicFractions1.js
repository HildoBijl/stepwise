const { getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { getRandomIndices, hasSimpleMatching } = require('../../../util/arrays')
const { Variable, Sum, Product, Fraction, expressionChecks } = require('../../../CAS')

const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performCheck } = require('../util/check')

const { equivalent } = expressionChecks

const data = {
	skill: 'mergeSplitBasicFractions',
	check: (correct, input, { toSplit }) => {
		// When the mission is to split, check for a sum with the right length and for the terms to match.
		if (toSplit)
			return input.isType(Sum) && correct.terms.length === input.terms.length && hasSimpleMatching(correct.terms, input.terms, equivalent)
		// When the mission is to merge, check for a correct fraction, and for no fractions inside fractions.
		return input.isType(Fraction) && !input.hasFractions() && equivalent(correct, input)
	},
	variableSets: [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']].map(variableSet => variableSet.map(Variable.ensureVariable)),
	usedVariables: ['x', 'y', 'z'],
}

function generateState() {
	// ax/(cz) + by/(cz) = (ax+by)/(cz).
	const state = {}
	state.toSplit = getRandomBoolean() // Should we split? Or merge?
	state.a = getRandomInteger(2, 12)
	state.b = getRandomInteger(2, 12, [state.a])
	state.c = getRandomInteger(2, 12, [state.a, state.b])
	state.plus = getRandomBoolean()
	state.variableSet = getRandomInteger(0, 2)
	state.variables = getRandomIndices(data.variableSets[state.variableSet].length, 3)
	return state
}

function getVariables(state) {
	const result = {}
	data.usedVariables.forEach((variable, index) => {
		result[variable] = data.variableSets[state.variableSet][state.variables[index]]
	})
	return result
}

function getCorrect(state) {
	const variables = getVariables(state)
	const { toSplit, a, b, c, plus } = state
	const { x, y, z } = variables
	const ax = new Product(a, x)
	const by = new Product(b, y)
	const cz = new Product(c, z)
	const together = ax[plus ? 'add' : 'subtract'](by).divideBy(cz)
	const split = ax.divideBy(cz)[plus ? 'add' : 'subtract'](by.divideBy(cz))
	const expression = (toSplit ? together : split)
	const ans = (toSplit ? split : together)
	return { ...state, variables, together, split, expression, ans }
}

function checkInput(state, input) {
	return performCheck('ans', getCorrect(state), input, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	getVariables,
	getCorrect,
	checkInput,
}