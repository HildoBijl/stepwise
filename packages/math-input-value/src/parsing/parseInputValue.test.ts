import { describe, expect, test } from 'vitest'

import { parseEquationInputValue, parseExpressionInputValue } from './parseInputValue'

const expression = (...value: unknown[]) => ({ type: 'Expression', value })

describe('parseExpressionInputValue', () => {
	test('keeps plain expressions and ordinary text functions as text', () => {
		expect(parseExpressionInputValue(' 2 + sin(x) ')).toEqual(expression('2+sin(x)'))
	})

	test('parses subscripts', () => {
		expect(parseExpressionInputValue('x_1')).toEqual(expression('x', { type: 'SubSup', subscript: '1' }, ''))
	})

	test('parses superscripts', () => {
		expect(parseExpressionInputValue('x^2')).toEqual(expression('x', { type: 'SubSup', superscript: ['2'] }, ''))
	})

	test('parses combined subscripts and superscripts', () => {
		expect(parseExpressionInputValue('x_1^2')).toEqual(expression('x', { type: 'SubSup', subscript: '1', superscript: ['2'] }, ''))
	})

	test('parses fractions', () => {
		expect(parseExpressionInputValue('x/y')).toEqual(expression('', { type: 'Fraction', alias: '/', numerator: ['x'], denominator: ['y'] }, ''))
	})

	test('parses nested fractions', () => {
		expect(parseExpressionInputValue('x/(y/z)')).toEqual(expression('', {
			type: 'Fraction',
			alias: '/',
			numerator: ['x'],
			denominator: ['', { type: 'Fraction', alias: '/', numerator: ['y'], denominator: ['z'] }, ''],
		}, ''))
	})

	test('parses square roots', () => {
		expect(parseExpressionInputValue('sqrt(x+1)')).toEqual(expression('', { type: 'SquareRoot', alias: 'sqrt(', radicand: ['x+1'] }, ''))
	})

	test('parses roots with an explicit degree', () => {
		expect(parseExpressionInputValue('root[3](x+1)')).toEqual(expression('', { type: 'Root', alias: 'root(', degree: ['3'], radicand: ['x+1'] }, ''))
	})

	test('fills in the default root degree', () => {
		expect(parseExpressionInputValue('root(x)')).toEqual(expression('', { type: 'Root', alias: 'root(', degree: ['2'], radicand: ['x'] }, ''))
	})

	test('parses logarithms with an explicit base and an external argument', () => {
		expect(parseExpressionInputValue('log[2](x+1)')).toEqual(expression('', { type: 'Logarithm', alias: 'log(', base: ['2'] }, 'x+1)'))
	})

	test('fills in the default logarithm base', () => {
		expect(parseExpressionInputValue('log(x)')).toEqual(expression('', { type: 'Logarithm', alias: 'log(', base: ['10'] }, 'x)'))
	})

	test.each(['dot', 'hat'])('parses the %s accent', name => {
		expect(parseExpressionInputValue(`${name}(x)`)).toEqual(expression('', { type: 'Accent', name, alias: `${name}(`, value: 'x' }, ''))
	})

	test('parses nested constructs', () => {
		expect(parseExpressionInputValue('root[3](x/y)^2')).toEqual(expression(
			'',
			{ type: 'Root', alias: 'root(', degree: ['3'], radicand: ['', { type: 'Fraction', alias: '/', numerator: ['x'], denominator: ['y'] }, ''] },
			'',
			{ type: 'SubSup', superscript: ['2'] },
			'',
		))
	})

	test('can wrap the parsed value as an equation', () => {
		expect(parseEquationInputValue('x=2')).toEqual({ type: 'Equation', value: ['x=2'] })
	})

	test('stores non-default interpretation and expression settings', () => {
		expect(parseExpressionInputValue('x', { interpretEAsConstant: false }, { angleUnit: 'degrees' })).toEqual({
			...expression('x'),
			interpretationSettings: { interpretEAsConstant: false },
			expressionSettings: { angleUnit: 'degrees' },
		})
	})

	test('omits explicitly supplied default settings', () => {
		expect(parseExpressionInputValue('x', { interpretEAsConstant: true }, { angleUnit: 'radians' })).toEqual(expression('x'))
	})
})
