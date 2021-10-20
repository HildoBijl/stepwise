const { getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { getRandomIndices } = require('../../../util/arrays')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const { Expression } = require('../../../inputTypes/Expression')
const Product = require('../../../inputTypes/Expression/Product')
const Sum = require('../../../inputTypes/Expression/Sum')
const Fraction = require('../../../inputTypes/Expression/functions/Fraction')
const Variable = require('../../../inputTypes/Expression/Variable')

const data = {
	skill: 'mergeSplitBasicFractions',
	equalityOptions: {
		default: Expression.equalityLevels.onlyOrderChanges,
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
	const { toSplit, ans } = getCorrect(state)

	// When the mission is to split, check that we have a sum with the right length and that the terms match.
	if (toSplit)
		return input.ans.isType(Sum) && ans.terms.length === input.ans.terms.length && (ans.terms[0].equals(input.ans.terms[0]) && ans.terms[1].equals(input.ans.terms[1]) || (ans.terms[0].equals(input.ans.terms[1]) && ans.terms[1].equals(input.ans.terms[0])))

	// When the mission is to merge, check that we have a correct fraction, and that inside the fraction are no fractions.
	return input.ans.isType(Fraction) && ans.equals(input.ans) && !input.ans.numerator.recursiveSome(term => term.isType(Fraction)) && !input.ans.denominator.recursiveSome(term => term.isType(Fraction))
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	getVariables,
	getCorrect,
	checkInput,
}