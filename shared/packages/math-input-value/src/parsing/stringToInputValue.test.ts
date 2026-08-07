import { stringToInputValue } from './stringToInputValue'

const text = (value: string) => ({ type: 'ExpressionPart', value })
const expression = (...value: unknown[]) => ({ type: 'Expression', value })
const func = (name: string, value: unknown[], alias?: string) => ({ type: 'Function', name, value, ...(alias === undefined ? {} : { alias }) })

describe('stringToInputValue', () => {
	test('keeps plain expressions and ordinary text functions as text', () => {
		expect(stringToInputValue(' 2 + sin(x) ')).toEqual(expression(text('2+sin(x)')))
	})

	test('parses subscripts', () => {
		expect(stringToInputValue('x_1')).toEqual(expression(
			text('x'),
			{ type: 'Function', name: 'subSup', value: [{ type: 'SubscriptText', value: '1' }] },
			text(''),
		))
	})

	test('parses superscripts', () => {
		expect(stringToInputValue('x^2')).toEqual(expression(
			text('x'),
			{ type: 'Function', name: 'subSup', value: [undefined, expression(text('2'))] },
			text(''),
		))
	})

	test('parses combined subscripts and superscripts', () => {
		expect(stringToInputValue('x_1^2')).toEqual(expression(
			text('x'),
			{ type: 'Function', name: 'subSup', value: [{ type: 'SubscriptText', value: '1' }, expression(text('2'))] },
			text(''),
		))
	})

	test('parses fractions', () => {
		expect(stringToInputValue('x/y')).toEqual(expression(
			text(''),
			func('frac', [expression(text('x')), expression(text('y'))]),
			text(''),
		))
	})

	test('parses nested fractions', () => {
		expect(stringToInputValue('x/(y/z)')).toEqual(expression(
			text(''),
			func('frac', [expression(text('x')), expression(text(''), func('frac', [expression(text('y')), expression(text('z'))]), text(''))]),
			text(''),
		))
	})

	test('parses square roots', () => {
		expect(stringToInputValue('sqrt(x+1)')).toEqual(expression(
			text(''),
			func('sqrt', [expression(text('x+1'))], 'sqrt('),
			text(''),
		))
	})

	test('parses roots with an explicit degree', () => {
		expect(stringToInputValue('root[3](x+1)')).toEqual(expression(
			text(''),
			func('root', [expression(text('3')), expression(text('x+1'))], 'root('),
			text(''),
		))
	})

	test('fills in the default root degree', () => {
		expect(stringToInputValue('root(x)')).toEqual(expression(
			text(''),
			func('root', [expression(text('2')), expression(text('x'))], 'root('),
			text(''),
		))
	})

	test('parses logarithms with an explicit base and an external argument', () => {
		expect(stringToInputValue('log[2](x+1)')).toEqual(expression(
			text(''),
			func('log', [expression(text('2'))], 'log('),
			text('x+1)'),
		))
	})

	test('fills in the default logarithm base', () => {
		expect(stringToInputValue('log(x)')).toEqual(expression(
			text(''),
			func('log', [expression(text('10'))], 'log('),
			text('x)'),
		))
	})

	test.each(['dot', 'hat'])('parses the %s accent', name => {
		expect(stringToInputValue(`${name}(x)`)).toEqual(expression(
			text(''),
			{ type: 'Accent', name, alias: `${name}(`, value: 'x' },
			text(''),
		))
	})

	test('parses nested constructs', () => {
		expect(stringToInputValue('root[3](x/y)^2')).toEqual(expression(
			text(''),
			func('root', [expression(text('3')), expression(text(''), func('frac', [expression(text('x')), expression(text('y'))]), text(''))], 'root('),
			text(''),
			{ type: 'Function', name: 'subSup', value: [undefined, expression(text('2'))] },
			text(''),
		))
	})

	test('can wrap the parsed value as an equation', () => {
		expect(stringToInputValue('x=2', undefined, undefined, true)).toEqual({
			type: 'Equation',
			value: [text('x=2')],
		})
	})

	test('stores non-default interpretation and expression settings', () => {
		expect(stringToInputValue('x', { eAsConstant: false }, { degrees: true })).toEqual({
			...expression(text('x')),
			interpretationSettings: { eAsConstant: false },
			expressionSettings: { degrees: true },
		})
	})

	test('omits explicitly supplied default settings', () => {
		expect(stringToInputValue('x', { eAsConstant: true }, { degrees: false })).toEqual(expression(text('x')))
	})
})
