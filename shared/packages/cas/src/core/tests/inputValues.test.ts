import type { EquationInputValue, ExpressionInputValue, FunctionInputValue, InputValuePart } from '@step-wise/math-input-value'

import { fraction, inputValueToNode, log, power, root, sqrt, sum, variable } from '../construction'
import { asEquation } from '../../equations'

import { expectNodeToEqual } from './testUtils'

const text = (value: string) => ({ type: 'ExpressionPart', value }) as const
const expression = (...value: InputValuePart[]): ExpressionInputValue => ({ type: 'Expression', value })
const func = (name: string, value: ExpressionInputValue[], alias?: string): FunctionInputValue => ({ type: 'Function', name, value, ...(alias === undefined ? {} : { alias }) })

describe('expression input value interpretation', () => {
	test('interprets plain expression text', () => {
		expectNodeToEqual(inputValueToNode(expression(text('2+x'))), sum(2, 'x'))
	})

	test('interprets fractions', () => {
		const input = expression(text(''), func('frac', [expression(text('x')), expression(text('y'))]), text(''))
		expectNodeToEqual(inputValueToNode(input), fraction('x', 'y'))
	})

	test('interprets nested fractions', () => {
		const inner = func('frac', [expression(text('y')), expression(text('z'))])
		const outer = func('frac', [expression(text('x')), expression(text(''), inner, text(''))])
		expectNodeToEqual(inputValueToNode(expression(text(''), outer, text(''))), fraction('x', fraction('y', 'z')))
	})

	test('interprets square roots', () => {
		const input = expression(text(''), func('sqrt', [expression(text('x+1'))], 'sqrt('), text(''))
		expectNodeToEqual(inputValueToNode(input), sqrt(sum('x', 1)))
	})

	test('interprets roots', () => {
		const input = expression(text(''), func('root', [expression(text('3')), expression(text('x+1'))], 'root('), text(''))
		expectNodeToEqual(inputValueToNode(input), root(sum('x', 1), 3))
	})

	test('uses the default degree for an empty root degree', () => {
		const input = expression(text(''), func('root', [expression(text('')), expression(text('x'))], 'root('), text(''))
		expectNodeToEqual(inputValueToNode(input), root('x', 2))
	})

	test('interprets logarithms with an external argument', () => {
		const input = expression(text(''), func('log', [expression(text('2'))], 'log('), text('x+1)'))
		expectNodeToEqual(inputValueToNode(input), log(sum('x', 1), 2))
	})

	test('interprets logarithms with the stored default base', () => {
		const input = expression(text(''), func('log', [expression(text('10'))], 'log('), text('x)'))
		expectNodeToEqual(inputValueToNode(input), log('x', 10))
	})

	test('interprets subscripts', () => {
		const subSup: InputValuePart = { type: 'Function', name: 'subSup', value: [{ type: 'SubscriptText', value: '1' }] }
		expectNodeToEqual(inputValueToNode(expression(text('x'), subSup, text(''))), variable('x', '1'))
	})

	test('interprets superscripts', () => {
		const subSup: InputValuePart = { type: 'Function', name: 'subSup', value: [undefined, expression(text('2'))] }
		expectNodeToEqual(inputValueToNode(expression(text('x'), subSup, text(''))), power('x', 2))
	})

	test('interprets combined subscripts and superscripts', () => {
		const subSup: InputValuePart = {
			type: 'Function',
			name: 'subSup',
			value: [{ type: 'SubscriptText', value: '1' }, expression(text('2'))],
		}
		expectNodeToEqual(inputValueToNode(expression(text('x'), subSup, text(''))), power(variable('x', '1'), 2))
	})

	test.each(['dot', 'hat'] as const)('interprets the %s accent', name => {
		const accent: InputValuePart = { type: 'Accent', name, alias: `${name}(`, value: 'x' }
		expectNodeToEqual(inputValueToNode(expression(text(''), accent, text(''))), variable('x', undefined, name))
	})

	test('uses interpretation settings from the input value', () => {
		const input: ExpressionInputValue = { ...expression(text('xy')), interpretationSettings: { multiCharacterVariables: true } }
		expectNodeToEqual(inputValueToNode(input), variable('xy'))
	})
})

describe('equation input value interpretation', () => {
	test('splits a directly supplied equation input value', () => {
		const input: EquationInputValue = { type: 'Equation', value: [text('x+1=2')] }
		expect(asEquation(input).str).toBe('x+1=2')
	})

	test('interprets constructs on both sides', () => {
		const fractionElement = func('frac', [expression(text('x')), expression(text('2'))])
		const rootElement = func('sqrt', [expression(text('y'))], 'sqrt(')
		const input: EquationInputValue = { type: 'Equation', value: [text(''), fractionElement, text('='), rootElement, text('')] }
		expect(asEquation(input).str).toBe('x/2=sqrt(y)')
	})

	test('preserves expression settings', () => {
		const input: EquationInputValue = { type: 'Equation', value: [text('sin(90)=1')], expressionSettings: { degrees: true } }
		expect(asEquation(input).settings.degrees).toBe(true)
	})

	test('rejects missing and multiple equals signs', () => {
		expect(() => asEquation({ type: 'Equation', value: [text('x+1')] })).toThrow('no equals sign')
		expect(() => asEquation({ type: 'Equation', value: [text('x=1=2')] })).toThrow('multiple equals signs')
	})
})
