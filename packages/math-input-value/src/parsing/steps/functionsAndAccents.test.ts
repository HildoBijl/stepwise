import { describe, expect, it, vi } from 'vitest'

import { defaultInterpretationSettings } from '../../settings'
import type { ExpressionValue } from '../../types'

import { parseFunctionsAndAccents } from './functionsAndAccents'

const parse = (value: ExpressionValue) => value

describe('parseFunctionsAndAccents', () => {
	it('parses roots and their optional arguments', () => {
		expect(parseFunctionsAndAccents(['sqrt(x)'], defaultInterpretationSettings, parse)).toEqual(['', { type: 'SquareRoot', alias: 'sqrt(', radicand: ['x'] }, ''])
		expect(parseFunctionsAndAccents(['root(x)'], defaultInterpretationSettings, parse)).toEqual(['', { type: 'Root', alias: 'root(', degree: ['2'], radicand: ['x'] }, ''])
		expect(parseFunctionsAndAccents(['root[3](x)'], defaultInterpretationSettings, parse)).toEqual(['', { type: 'Root', alias: 'root(', degree: ['3'], radicand: ['x'] }, ''])
	})

	it('parses logarithms while keeping their external argument', () => {
		expect(parseFunctionsAndAccents(['log[2](x+1)'], defaultInterpretationSettings, parse)).toEqual(['', { type: 'Logarithm', alias: 'log(', base: ['2'] }, 'x+1)'])
	})

	it.each(['dot', 'hat'])('parses the %s accent', name => {
		expect(parseFunctionsAndAccents([`${name}(x)`], defaultInterpretationSettings, parse)).toEqual(['', { type: 'Accent', name, alias: `${name}(`, value: 'x' }, ''])
	})

	it('keeps unknown functions as text and parses their contents recursively', () => {
		expect(parseFunctionsAndAccents(['sin(sqrt(x))'], defaultInterpretationSettings, parse)).toEqual(['sin(', { type: 'SquareRoot', alias: 'sqrt(', radicand: ['x'] }, ')'])
	})

	it('rejects unsupported optional arguments and non-text accents', () => {
		expect(() => parseFunctionsAndAccents(['sqrt[2](x)'], defaultInterpretationSettings, parse)).toThrow('allows at most 0')
		expect(() => parseFunctionsAndAccents(['sin[2](x)'], defaultInterpretationSettings, parse)).toThrow('does not support optional parameters')
		const nested: ExpressionValue = ['dot(', { type: 'SquareRoot', radicand: ['x'] }, ')']
		expect(() => parseFunctionsAndAccents(nested, defaultInterpretationSettings, parse)).toThrow('must be plain text')
	})

	it('forwards settings to the recursive parser', () => {
		const parser = vi.fn(parse)
		parseFunctionsAndAccents(['root[3](x)'], defaultInterpretationSettings, parser)
		expect(parser).toHaveBeenCalledWith(['3'], defaultInterpretationSettings)
		expect(parser).toHaveBeenCalledWith(['x'], defaultInterpretationSettings)
	})
})
