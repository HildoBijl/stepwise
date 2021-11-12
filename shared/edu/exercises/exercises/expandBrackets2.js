const { getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { asExpression, simplifyOptions, expressionEqualityLevels, equationEqualityLevels } = require('../../../CAS')

const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'expandBrackets',
	weight: 2,
	equalityOptions: {
		default: {
			equation: equationEqualityLevels.onlyOrderChanges,
			expression: expressionEqualityLevels.keepSides,
		},
	},
}

function generateState() {
	// ax*(by+cz) = abxy+acxz.
	const a = getRandomInteger(-12, 12, [0, 1])
	const b = getRandomInteger(2, 12)
	const c = getRandomInteger(-12, 12, [0, 1, b, -b])
	return {
		a, b, c,
		expand: getRandomBoolean(),
	}
}

function getExpression({ a, b, c, expand }) {
	return asExpression(expand ? 'ax*(by+cz)' : 'abxy+acxz')
		.substitute('a', a)
		.substitute('b', b)
		.substitute('c', c)
		.simplify(simplifyOptions.basicClean)
}

function getCorrect(state) {
	const { expand, a, b, c } = state

	// Get the original expression.
	const expression = getExpression(state)
	const terms = [
		asExpression('ax').substitute('a', a),
		asExpression('by').substitute('b', b),
		asExpression('cz').substitute('c', c),
	]

	// Determine the answer.
	let intermediate, ans
	if (expand) {
		intermediate = expression.simplify({ expandBrackets: true })
		ans = intermediate.simplify(simplifyOptions.basicClean)
	} else {
		intermediate = terms[0].multiplyBy(expression.divideBy(terms[0]).simplify({ splitFractions: true }))
		ans = expression.pullOutsideBrackets(terms[0])
	}

	return { ...state, expression, terms, intermediate, ans }
}

function checkInput(state, input) {
	const { ans } = getCorrect(state)
	return ans.equals(input.ans, data.equalityOptions.default)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	getExpression,
	getCorrect,
	checkInput,
}