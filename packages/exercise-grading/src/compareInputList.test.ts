import { IntegerType, MultipleChoiceType } from '@step-wise/value-types'
import { describe, expect, it } from 'vitest'

import { compareInputEntry } from './compareInputEntry.ts'
import { compareInputList } from './compareInputList.ts'
import { makeCheckInputData } from './testUtils.ts'

describe('compareInputList', () => {
	it('matches values independently of their order', () => {
		const data = makeCheckInputData({ x: { type: IntegerType, value: '1' }, y: { type: IntegerType, value: '2' } }, { x: 2, y: 1 })
		expect(compareInputList(['x', 'y'], data)).toBe(true)
	})

	it('requires a one-to-one matching', () => {
		const data = makeCheckInputData({ x: { type: IntegerType, value: '1' }, y: { type: IntegerType, value: '1' } }, { x: 1, y: 2 })
		expect(compareInputList(['x', 'y'], data)).toBe(false)
	})

	it('compares an input entry with a differently keyed solution entry', () => {
		const data = makeCheckInputData({ x: { type: IntegerType, value: '2' }, y: { type: IntegerType, value: '1' } }, { x: 1, y: 2 })
		expect(compareInputEntry('x', 'y', data)).toBe(true)
		expect(compareInputEntry('x', 'x', data)).toBe(false)
	})

	it('rejects list comparisons containing different input types', () => {
		const data = makeCheckInputData({ x: { type: IntegerType, value: '1' }, y: { type: MultipleChoiceType, value: [1] } }, { x: 1, y: [1] })
		expect(() => compareInputList(['x', 'y'], data)).toThrow(/same type/)
		expect(() => compareInputEntry('x', 'y', data)).toThrow(/same type/)
	})
	it('rejects empty lists and missing input or solution keys', () => {
		const data = makeCheckInputData({ x: { type: IntegerType, value: '1' } }, { x: 1 })
		expect(() => compareInputList([], data)).toThrow(RangeError)
		expect(() => compareInputEntry('missing', 'x', data)).toThrow(/missing/)
		expect(() => compareInputEntry('x', 'missing', data)).toThrow(/missing/)
	})
})
