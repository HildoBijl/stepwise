const { getRandomInteger } = require('../../../util/random')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

// Testing code.
const Expression = require('../../../inputTypes/Expression/Expression')
const Constant = require('../../../inputTypes/Expression/Constant')
const Variable = require('../../../inputTypes/Expression/Variable')
const Sum = require('../../../inputTypes/Expression/Sum')
const Product = require('../../../inputTypes/Expression/Product')

const a = new Constant(-5)
const b = a.multiplyBy(4)
const c = new Variable({
	symbol: 'x',
	accent: undefined,
	subscript: '2',
	factor: -6,
})
const d = new Variable('x_2')
d.factor = 2
const e = new Sum({
	factor: -7,
	terms: [c, a, d],
})
const f = new Product({
	factor: 3,
	terms: [e, c, b],
})

console.log(a.str)
console.log(c.str)
console.log(d.str)
console.log(e.str)
console.log(e.SO)
console.log(e.getDerivative('x_2').str)
console.log(f.str)
console.log(f.getDerivative('x_2').str)

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