const { getRandomInteger } = require('../../../util/random')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

// Testing code.
const Expression = require('../../../inputTypes/Expression/Expression')
const Constant = require('../../../inputTypes/Expression/Constant')
const Variable = require('../../../inputTypes/Expression/Variable')

const a = new Constant(-5)
const b = a.multiplyBy(4)
const c = new Variable({
	symbol: 'x',
	accent: 'dot',
	subscript:'x=0',
})
const d = new Variable('dot(x)_[x=0]')

console.log(c.str)
console.log(c.dependsOn(c))
console.log(d.str)
console.log(c.dependsOn(d))


const data = {
	skill: 'fillInExpression',
	equalityOptions: {
		// TODO
	},
}

const expressions = [
	'a\\cdot b+c \\pm 2 \\mp 3',
	// 'a\\left(b+c\\right)',
	// '\\log(x^2)',
	// ToDo: eventually add all use cases here.
]

function generateState() {
	return { index: getRandomInteger(0, expressions.length - 1) }
}

function getCorrect({ index }) {
	return expressions[index]
}

function checkInput(state, { ans }) {
	const correct = getCorrect(state)
	return correct.equals(ans, data.equalityOptions)
}

module.exports = {
	data,
	expressions,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}