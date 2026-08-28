import { describe, expect, it, vi } from 'vitest'

import { defaultInterpretationSettings } from '../../settings/index.ts'

import { parseSubSups } from './subSups.ts'

const parse = (source: string) => [source]

describe('parseSubSups', () => {
	it.each([
		['x_1', ['x', { type: 'SubSup', subscript: '1' }, '']],
		['x_(long)', ['x', { type: 'SubSup', subscript: 'long' }, '']],
		['x^2.5y', ['x', { type: 'SubSup', superscript: ['2.5'] }, 'y']],
		['x^-.5', ['x', { type: 'SubSup', superscript: ['-.5'] }, '']],
		['x^(a+(b))', ['x', { type: 'SubSup', superscript: ['a+(b)'] }, '']],
		['x_1^2', ['x', { type: 'SubSup', subscript: '1', superscript: ['2'] }, '']],
		['x^2_1', ['x', { type: 'SubSup', subscript: '1', superscript: ['2'] }, '']],
	] as const)('parses %s', (source, expected) => {
		expect(parseSubSups([source], defaultInterpretationSettings, parse)).toEqual(expected)
	})

	it('preserves existing constructs', () => {
		const construct = { type: 'SquareRoot' as const, radicand: ['x'] }
		expect(parseSubSups(['a', construct, 'b'], defaultInterpretationSettings, parse)).toEqual(['a', construct, 'b'])
	})

	it('forwards settings to recursive parsing', () => {
		const parser = vi.fn(parse)
		parseSubSups(['x^(a)'], defaultInterpretationSettings, parser)
		expect(parser).toHaveBeenCalledWith('a', defaultInterpretationSettings)
	})

	it.each(['x_', 'x^'])('rejects an empty script in %s', source => {
		expect(() => parseSubSups([source], defaultInterpretationSettings, parse)).toThrow()
	})

	it.each(['x_(a', 'x^(a'])('rejects unmatched parentheses in %s', source => {
		expect(() => parseSubSups([source], defaultInterpretationSettings, parse)).toThrow('missing closing bracket')
	})
})
