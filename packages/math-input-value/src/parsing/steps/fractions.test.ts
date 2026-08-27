import { describe, expect, it, vi } from 'vitest'

import { defaultInterpretationSettings } from '../../settings'
import type { ExpressionValue } from '../../types'

import { parseFractions } from './fractions'

const parse = (value: ExpressionValue) => value
const fraction = (numerator: ExpressionValue, denominator: ExpressionValue) => ({ type: 'Fraction', alias: '/', numerator, denominator })

describe('parseFractions', () => {
	it('parses a simple fraction and removes operand brackets', () => {
		expect(parseFractions(['x/y'], defaultInterpretationSettings, parse)).toEqual(['', fraction(['x'], ['y']), ''])
		expect(parseFractions(['(x)/(y)'], defaultInterpretationSettings, parse)).toEqual(['', fraction(['x'], ['y']), ''])
	})

	it('uses factor operators as operand boundaries', () => {
		expect(parseFractions(['a+x/y-b'], defaultInterpretationSettings, parse)).toEqual(['a+', fraction(['x'], ['y']), '-b'])
	})

	it('includes existing constructs in operands', () => {
		const root = { type: 'SquareRoot' as const, radicand: ['x'] }
		expect(parseFractions(['', root, '/2'], defaultInterpretationSettings, parse)).toEqual(['', fraction(['', root, ''], ['2']), ''])
	})

	it('parses repeated division symbols', () => {
		expect(parseFractions(['a/b/c'], defaultInterpretationSettings, parse)).toEqual(['', fraction(['', fraction(['a'], ['b']), ''], ['c']), ''])
	})

	it('allows incomplete editing-state operands', () => {
		expect(parseFractions(['/'], defaultInterpretationSettings, parse)).toEqual(['', fraction([''], ['']), ''])
	})

	it('forwards settings and operands to recursive parsing', () => {
		const parser = vi.fn(parse)
		parseFractions(['x/y'], defaultInterpretationSettings, parser)
		expect(parser).toHaveBeenNthCalledWith(1, ['x'], defaultInterpretationSettings)
		expect(parser).toHaveBeenNthCalledWith(2, ['y'], defaultInterpretationSettings)
	})
})
