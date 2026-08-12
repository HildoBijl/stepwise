import { stringToInputValue } from './stringToInputValue'

const expression = (...value: unknown[]) => ({ type: 'Expression', value })

describe('stringToInputValue', () => {
	test('keeps plain expressions and ordinary text functions as text', () => {
		expect(stringToInputValue(' 2 + sin(x) ')).toEqual(expression('2+sin(x)'))
	})

	test('parses subscripts', () => {
		expect(stringToInputValue('x_1')).toEqual(expression('x', { type: 'SubSup', subscript: '1' }, ''))
	})

	test('parses superscripts', () => {
		expect(stringToInputValue('x^2')).toEqual(expression('x', { type: 'SubSup', superscript: ['2'] }, ''))
	})

	test('parses combined subscripts and superscripts', () => {
		expect(stringToInputValue('x_1^2')).toEqual(expression('x', { type: 'SubSup', subscript: '1', superscript: ['2'] }, ''))
	})

	test('parses fractions', () => {
		expect(stringToInputValue('x/y')).toEqual(expression('', { type: 'Fraction', alias: '/', numerator: ['x'], denominator: ['y'] }, ''))
	})

	test('parses nested fractions', () => {
		expect(stringToInputValue('x/(y/z)')).toEqual(expression('', {
			type: 'Fraction',
			alias: '/',
			numerator: ['x'],
			denominator: ['', { type: 'Fraction', alias: '/', numerator: ['y'], denominator: ['z'] }, ''],
		}, ''))
	})

	test('parses square roots', () => {
		expect(stringToInputValue('sqrt(x+1)')).toEqual(expression('', { type: 'SquareRoot', alias: 'sqrt(', radicand: ['x+1'] }, ''))
	})

	test('parses roots with an explicit degree', () => {
		expect(stringToInputValue('root[3](x+1)')).toEqual(expression('', { type: 'Root', alias: 'root(', degree: ['3'], radicand: ['x+1'] }, ''))
	})

	test('fills in the default root degree', () => {
		expect(stringToInputValue('root(x)')).toEqual(expression('', { type: 'Root', alias: 'root(', degree: ['2'], radicand: ['x'] }, ''))
	})

	test('parses logarithms with an explicit base and an external argument', () => {
		expect(stringToInputValue('log[2](x+1)')).toEqual(expression('', { type: 'Logarithm', alias: 'log(', base: ['2'] }, 'x+1)'))
	})

	test('fills in the default logarithm base', () => {
		expect(stringToInputValue('log(x)')).toEqual(expression('', { type: 'Logarithm', alias: 'log(', base: ['10'] }, 'x)'))
	})

	test.each(['dot', 'hat'])('parses the %s accent', name => {
		expect(stringToInputValue(`${name}(x)`)).toEqual(expression('', { type: 'Accent', name, alias: `${name}(`, value: 'x' }, ''))
	})

	test('parses nested constructs', () => {
		expect(stringToInputValue('root[3](x/y)^2')).toEqual(expression(
			'',
			{ type: 'Root', alias: 'root(', degree: ['3'], radicand: ['', { type: 'Fraction', alias: '/', numerator: ['x'], denominator: ['y'] }, ''] },
			'',
			{ type: 'SubSup', superscript: ['2'] },
			'',
		))
	})

	test('can wrap the parsed value as an equation', () => {
		expect(stringToInputValue('x=2', undefined, undefined, true)).toEqual({ type: 'Equation', value: ['x=2'] })
	})

	test('stores non-default interpretation and expression settings', () => {
		expect(stringToInputValue('x', { eAsConstant: false }, { degrees: true })).toEqual({
			...expression('x'),
			interpretationSettings: { eAsConstant: false },
			expressionSettings: { degrees: true },
		})
	})

	test('omits explicitly supplied default settings', () => {
		expect(stringToInputValue('x', { eAsConstant: true }, { degrees: false })).toEqual(expression('x'))
	})
})
