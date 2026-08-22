import { describe, expect, it } from 'vitest'

import { generateMultipleChoiceMapping } from './multipleChoice'

describe('generateMultipleChoiceMapping', () => {
	it('returns every choice in order by default', () => {
		expect(generateMultipleChoiceMapping({ numChoices: 4 })).toEqual([0, 1, 2, 3])
	})

	it('picks the requested number and always includes specified choices', () => {
		const mapping = generateMultipleChoiceMapping({ numChoices: 6, pick: 3, include: [1, 4] })
		expect(mapping).toHaveLength(3)
		expect(mapping).toEqual([...mapping].sort((a, b) => a - b))
		expect(mapping).toEqual(expect.arrayContaining([1, 4]))
		expect(new Set(mapping)).toHaveProperty('size', 3)
	})

	it('randomizes only the order when all choices are picked', () => {
		const mapping = generateMultipleChoiceMapping({ numChoices: 5, randomOrder: true })
		expect([...mapping].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4])
	})

	it.each([
		{ numChoices: 0 },
		{ numChoices: 2, pick: 3 },
		{ numChoices: 3, pick: 1, include: [0, 1] },
		{ numChoices: 3, include: [1, 1] },
		{ numChoices: 3, include: -1 },
		{ numChoices: 3, include: 3 },
		{ numChoices: 3, randomOrder: 'yes' },
	])('rejects invalid options %#', options => {
		expect(() => generateMultipleChoiceMapping(options as never)).toThrow()
	})
})
