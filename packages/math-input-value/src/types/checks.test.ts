import { describe, expect, it } from 'vitest'

import { isAccentInputValue, isConstructInputValue, isEquationInputValue, isExpressionInputValue, isExpressionValue, isInputValuePart, isTextPart } from './checks'

const constructs = [
	{ type: 'Fraction', numerator: ['1'], denominator: ['2'] },
	{ type: 'SquareRoot', radicand: ['2'] },
	{ type: 'Root', degree: ['3'], radicand: ['2'] },
	{ type: 'Logarithm', base: ['10'] },
	{ type: 'SubSup', subscript: 'i' },
	{ type: 'SubSup', superscript: ['2'] },
	{ type: 'SubSup', subscript: 'i', superscript: ['2'] },
] as const

describe('input-value checks', () => {
	it.each(constructs)('accepts construct $type', construct => {
		expect(isConstructInputValue(construct)).toBe(true)
		expect(isInputValuePart(construct)).toBe(true)
	})

	it('accepts nested expression values and input wrappers', () => {
		const value = ['', { type: 'Fraction', alias: '/', numerator: ['x'], denominator: ['', { type: 'SquareRoot', radicand: ['2'] }, ''] }, '']
		expect(isExpressionValue(value)).toBe(true)
		expect(isExpressionInputValue({ type: 'Expression', value, interpretationSettings: { recognizeLogarithms: false } })).toBe(true)
		expect(isEquationInputValue({ type: 'Equation', value, expressionSettings: { angleUnit: 'degrees' } })).toBe(true)
	})

	it('accepts accents and text parts', () => {
		const accent = { type: 'Accent', name: 'hat', alias: 'hat(', value: 'x' }
		expect(isAccentInputValue(accent)).toBe(true)
		expect(isInputValuePart(accent)).toBe(true)
		expect(isTextPart('x')).toBe(true)
		expect(isTextPart(accent)).toBe(false)
	})

	it.each([
		[],
		[{ type: 'Accent', name: 'dot', value: 'x' }, ''],
		['', { type: 'Accent', name: 'dot', value: 'x' }],
		['', { type: 'Unknown' }, ''],
	])('rejects malformed expression value %#', value => {
		expect(isExpressionValue(value)).toBe(false)
	})

	it.each([
		{ type: 'Fraction', numerator: ['1'] },
		{ type: 'Root', degree: ['2'], radicand: [] },
		{ type: 'Logarithm', base: ['10'], alias: 2 },
		{ type: 'Accent', name: 'bar', value: 'x' },
		{ type: 'Accent', name: 'dot', value: 1 },
	])('rejects malformed part %#', value => {
		expect(isInputValuePart(value)).toBe(false)
	})

	it('rejects sparse arrays', () => {
		const value = new Array(3)
		value[0] = ''
		value[2] = ''
		expect(isExpressionValue(value)).toBe(false)
	})

	it('rejects direct and indirect cycles', () => {
		const direct: unknown[] = ['']
		direct.push({ type: 'SquareRoot', radicand: direct }, '')
		expect(isExpressionValue(direct)).toBe(false)

		const outer: unknown[] = ['']
		const inner: unknown[] = ['', { type: 'SquareRoot', radicand: outer }, '']
		outer.push({ type: 'Fraction', numerator: inner, denominator: ['1'] }, '')
		expect(isExpressionValue(outer)).toBe(false)
	})

	it('distinguishes expression and equation wrappers and validates settings', () => {
		expect(isExpressionInputValue({ type: 'Equation', value: ['x'] })).toBe(false)
		expect(isEquationInputValue({ type: 'Expression', value: ['x'] })).toBe(false)
		expect(isExpressionInputValue({ type: 'Expression', value: ['x'], expressionSettings: { angleUnit: 'gradians' } })).toBe(false)
		expect(isExpressionInputValue({ type: 'Expression', value: ['x'], interpretationSettings: { recognizeLogarithms: 'yes' } })).toBe(false)
	})
})
