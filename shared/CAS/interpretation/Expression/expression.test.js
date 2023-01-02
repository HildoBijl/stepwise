const { asExpression, expressionSubtypes, expressionComparisons } = require('../..')

const { Variable, Integer, Ln, Log, Root } = expressionSubtypes

const x = new Variable('x')
const y = new Variable('y')
const z = new Variable('z')

/*
 * Expression strToSI: turning a string into a storage input object.
 */
describe('The expression interpreter', () => {
	it('interprets variables', () => {
		expect(asExpression('x').equals(x)).toBe(true)
		expect(asExpression('dot(x)').equals(new Variable({ symbol: 'x', accent: 'dot' }))).toBe(true)
		expect(asExpression('x_2').equals(new Variable({ symbol: 'x', subscript: '2' }))).toBe(true)
		expect(asExpression('hat(x)_3').equals(new Variable({ symbol: 'x', accent: 'hat', subscript: '3' }))).toBe(true)
	})
	it('interprets sums', () => {
		expect(asExpression('x+y').equals(x.add(y))).toBe(true)
	})
	it('interprets products', () => {
		expect(asExpression('2x').equals(Integer.two.multiply(x))).toBe(true)
		expect(asExpression('2*x').equals(Integer.two.multiply(x))).toBe(true)
		expect(asExpression('xy').equals(x.multiply(y))).toBe(true)
		expect(asExpression('x2y').equals(x.multiply(Integer.two).multiply(y))).toBe(true)
	})
	it('interprets fractions', () => {
		expect(asExpression('x/y').equals(x.divide(y))).toBe(true)
		expect(asExpression('(2*x)/y').equals(Integer.two.multiply(x).divide(y))).toBe(true)
		expect(asExpression('x/(2*y)').equals(x.divide(Integer.two.multiply(y)))).toBe(true)
	})
	it('interprets powers', () => {
		expect(asExpression('2*x^y').equals(Integer.two.multiply(x.toPower(y)))).toBe(true)
		expect(asExpression('(2*x)^y').equals(Integer.two.multiply(x).toPower(y))).toBe(true)
		expect(asExpression('x^(2*y)').equals(x.toPower(Integer.two.multiply(y)))).toBe(true)
		expect(asExpression('x_2^3').equals(new Variable({ symbol: 'x', subscript: '2' }).toPower(Integer.three))).toBe(true)
		expect(asExpression('x^3_2').equals(new Variable({ symbol: 'x', subscript: '2' }).toPower(Integer.three))).toBe(true)
	})
	it('interprets basic functions', () => {
		expect(asExpression('ln(2*x)').equals(new Ln(Integer.two.multiply(x)))).toBe(true)
	})
	it('interprets advanced functions', () => {
		const yDot = new Variable({ symbol: 'y', accent: 'dot' })
		expect(asExpression('log(x)').equals(new Log(x))).toBe(true)
		expect(asExpression('log[dot(y)](x)').equals(new Log(x, yDot))).toBe(true)
		expect(asExpression('root(x)').equals(new Root(x))).toBe(true)
		expect(asExpression('root[dot(y)](x)').equals(new Root(x, yDot))).toBe(true)
	})
})

/*
 * Expression SItoFO: turning a storage input object into a functional object.
 */

// ToDo