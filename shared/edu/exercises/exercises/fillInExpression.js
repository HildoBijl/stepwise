import { getRandomInteger } from '../../../util/random'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

// Testing code.
import { getExpressionTypes } from '../../../inputTypes/Expression'
// const { Constant, Variable, Sum, Product, Power, Ln, Fraction, Sqrt, Root, Log, Sin, Cos, Asin } = getExpressionTypes()
// import { interpretExpression } from '../../../inputTypes/Expression/interpreter'

// const a = new Constant(-5)
// const b = a.multiplyBy(4)
// const c = new Variable({
// 	symbol: 'x',
// 	accent: '',
// 	subscript: '2',
// 	factor: -6,
// })
// const d = new Variable('x_2')
// d.factor = 2
// const e = new Sum({
// 	factor: -7,
// 	terms: [c, a, d],
// })
// const f = new Product({
// 	factor: 3,
// 	terms: [e, c, b],
// })
// const g = new Power({
// 	factor: 4,
// 	base: new Variable('x_2'),
// 	exponent: 3,
// })
// const h = new Power({
// 	base: new Variable('x'),
// 	exponent: new Variable('x'),
// })
// const i = new Asin(new Variable('x').multiplyBy(3))

// let j = new Fraction(h, i)
// j = j.multiplyBy(5).multiplyBy(-2)
// console.log(j.str)
// let k = new Product(j, e)
// console.log(k.str)

// console.log(a.str)
// console.log(c.str)
// console.log(d.str)
// console.log(e.str)
// console.log(e.SO)
// console.log(e.getDerivative('x_2').str)
// console.log(f.str)
// console.log(f.getDerivative('x_2').str)
// console.log(g.str)
// console.log(g.getDerivative(g.getVariables()[0]).str)
// console.log(h.str)
// console.log(h.getDerivative('x').str)
// console.log(i.str)
// console.log(i.getDerivative('x').str)
// console.log(i.getDerivative('x').getDerivative('x').str)
// console.log(e.str)
// console.log(e.getVariables())
// console.log(new Sqrt(e).multiplyBy(4).str)
// console.log(new Sqrt(e).multiplyBy(4).getDerivative('x_2').str)

// const x = new Variable('x')

// const fx = new Ln(new Sum(x, 1).multiplyBy(3)).multiplyBy(4)
// console.log(fx.str)
// console.log(fx.getDerivative().str)

// const fx = new Root(x.multiplyBy(2), new Sum(x, 1).multiplyBy(3)).multiplyBy(4)
// const fx = new Root(x.multiplyBy(2), x.multiplyBy(3))
// console.log(fx.str)
// console.log(fx.getDerivative().str)

export const data = {
	skill: 'fillInExpression',
	equalityOptions: {
		// TODO
	},
}

const expressions = [
	'a\\cdot b+c \\pm 2 \\mp 3',
	// 'a\\left(b+c\\right)',
	// ToDo: eventually add all use cases here.
]

export function generateState() {
	return { index: getRandomInteger(0, expressions.length - 1) }
}

export function getCorrect({ index }) {
	return expressions[index]
}

export function checkInput(state, { ans, eq }) {
	// const correct = getCorrect(state)
	// return correct.equals(ans, data.equalityOptions)
	console.log(ans)
	console.log(ans.str)
	console.log(eq)
	console.log(eq.str)
	return false
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)
