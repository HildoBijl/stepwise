import { describe, expect, it } from 'vitest'

import type { AccentInputValue, ExpressionValue } from '../types'

import { mergeAdjacentTextParts, sliceExpressionValue } from './manipulation'

const accent: AccentInputValue = { type: 'Accent', name: 'dot', value: 'x' }

describe('sliceExpressionValue', () => {
	it('slices within one text part and across constructs', () => {
		expect(sliceExpressionValue(['abcd'], { part: 0, cursor: 1 }, { part: 0, cursor: 3 })).toEqual(['bc'])
		expect(sliceExpressionValue(['ab', accent, 'cd'], { part: 0, cursor: 1 }, { part: 2, cursor: 1 })).toEqual(['b', accent, 'c'])
	})

	it('supports omitted cursors and empty slices', () => {
		const value: ExpressionValue = ['a', accent, 'b']
		expect(sliceExpressionValue(value)).toEqual(value)
		expect(sliceExpressionValue(['abc'], undefined, { part: 0, cursor: 2 })).toEqual(['ab'])
		expect(sliceExpressionValue(['abc'], { part: 0, cursor: 2 })).toEqual(['c'])
		expect(sliceExpressionValue(['abc'], { part: 0, cursor: 1 }, { part: 0, cursor: 1 })).toEqual([''])
	})

	it('rejects reversed and invalid cursors', () => {
		expect(() => sliceExpressionValue(['abc'], { part: 0, cursor: 2 }, { part: 0, cursor: 1 })).toThrow('cannot come after')
		expect(() => sliceExpressionValue(['abc'], { part: -1, cursor: 0 })).toThrow(RangeError)
		expect(() => sliceExpressionValue(['abc'], { part: 0, cursor: 4 })).toThrow('outside its text part')
		expect(() => sliceExpressionValue(['', accent, ''], { part: 1, cursor: 0 })).toThrow('must point to a text part')
	})
})

describe('mergeAdjacentTextParts', () => {
	it('merges consecutive text parts while preserving constructs', () => {
		expect(mergeAdjacentTextParts(['a', 'b', accent, 'c', 'd'])).toEqual(['ab', accent, 'cd'])
	})

	it('adds required text boundaries', () => {
		expect(mergeAdjacentTextParts([accent] as ExpressionValue)).toEqual(['', accent, ''])
	})

	it('leaves normalized values unchanged', () => {
		const value: ExpressionValue = ['a', accent, 'b']
		expect(mergeAdjacentTextParts(value)).toEqual(value)
	})
})
