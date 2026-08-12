import type { EquationInputValue, ExpressionInputValue, InputValuePart } from '@step-wise/math-input-value'

import { fraction, inputValueToNode, log, power, root, sqrt, sum, variable } from '../construction'
import { asEquation } from '../../equations'

import { expectNodeToEqual } from './testUtils'

const expression = (...value: InputValuePart[]): ExpressionInputValue => ({ type: 'Expression', value })

describe('expression input value interpretation', () => {
	test('interprets plain expression text', () => {
		expectNodeToEqual(inputValueToNode(expression('2+x')), sum(2, 'x'))
	})

	test('interprets fractions', () => {
		const input = expression('', { type: 'Fraction', numerator: ['x'], denominator: ['y'] }, '')
		expectNodeToEqual(inputValueToNode(input), fraction('x', 'y'))
	})

	test('interprets nested fractions', () => {
		const inner: InputValuePart = { type: 'Fraction', numerator: ['y'], denominator: ['z'] }
		const outer: InputValuePart = { type: 'Fraction', numerator: ['x'], denominator: ['', inner, ''] }
		expectNodeToEqual(inputValueToNode(expression('', outer, '')), fraction('x', fraction('y', 'z')))
	})

	test('interprets square roots', () => {
		const input = expression('', { type: 'SquareRoot', alias: 'sqrt(', radicand: ['x+1'] }, '')
		expectNodeToEqual(inputValueToNode(input), sqrt(sum('x', 1)))
	})

	test('interprets roots', () => {
		const input = expression('', { type: 'Root', alias: 'root(', degree: ['3'], radicand: ['x+1'] }, '')
		expectNodeToEqual(inputValueToNode(input), root(sum('x', 1), 3))
	})

	test('uses the default degree for an empty root degree', () => {
		const input = expression('', { type: 'Root', alias: 'root(', degree: [''], radicand: ['x'] }, '')
		expectNodeToEqual(inputValueToNode(input), root('x', 2))
	})

	test('interprets logarithms with an external argument', () => {
		const input = expression('', { type: 'Logarithm', alias: 'log(', base: ['2'] }, 'x+1)')
		expectNodeToEqual(inputValueToNode(input), log(sum('x', 1), 2))
	})

	test('uses the default base for an empty logarithm base', () => {
		const input = expression('', { type: 'Logarithm', alias: 'log(', base: [''] }, 'x)')
		expectNodeToEqual(inputValueToNode(input), log('x', 10))
	})

	test('interprets subscripts', () => {
		const subSup: InputValuePart = { type: 'SubSup', subscript: '1' }
		expectNodeToEqual(inputValueToNode(expression('x', subSup, '')), variable('x', '1'))
	})

	test('interprets superscripts', () => {
		const subSup: InputValuePart = { type: 'SubSup', superscript: ['2'] }
		expectNodeToEqual(inputValueToNode(expression('x', subSup, '')), power('x', 2))
	})

	test('interprets combined subscripts and superscripts', () => {
		const subSup: InputValuePart = { type: 'SubSup', subscript: '1', superscript: ['2'] }
		expectNodeToEqual(inputValueToNode(expression('x', subSup, '')), power(variable('x', '1'), 2))
	})

	test.each(['dot', 'hat'] as const)('interprets the %s accent', name => {
		const accent: InputValuePart = { type: 'Accent', name, alias: `${name}(`, value: 'x' }
		expectNodeToEqual(inputValueToNode(expression('', accent, '')), variable('x', undefined, name))
	})

	test('uses interpretation settings from the input value', () => {
		const input: ExpressionInputValue = { ...expression('xy'), interpretationSettings: { multiCharacterVariables: true } }
		expectNodeToEqual(inputValueToNode(input), variable('xy'))
	})
})

describe('equation input value interpretation', () => {
	test('splits a directly supplied equation input value', () => {
		const input: EquationInputValue = { type: 'Equation', value: ['x+1=2'] }
		expect(asEquation(input).str).toBe('x+1=2')
	})

	test('interprets constructs on both sides', () => {
		const fractionElement: InputValuePart = { type: 'Fraction', numerator: ['x'], denominator: ['2'] }
		const rootElement: InputValuePart = { type: 'SquareRoot', alias: 'sqrt(', radicand: ['y'] }
		const input: EquationInputValue = { type: 'Equation', value: ['', fractionElement, '=', rootElement, ''] }
		expect(asEquation(input).str).toBe('x/2=sqrt(y)')
	})

	test('preserves expression settings', () => {
		const input: EquationInputValue = { type: 'Equation', value: ['sin(90)=1'], expressionSettings: { degrees: true } }
		expect(asEquation(input).settings.degrees).toBe(true)
	})

	test('rejects missing and multiple equals signs', () => {
		expect(() => asEquation({ type: 'Equation', value: ['x+1'] })).toThrow('no equals sign')
		expect(() => asEquation({ type: 'Equation', value: ['x=1=2'] })).toThrow('multiple equals signs')
	})
})
