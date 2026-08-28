import { describe, expect, it } from 'vitest'

import { flattenRawSkillTree } from './flattening.ts'
import { validateAndProcessPrerequisites } from './prerequisiteProcessing.ts'

describe('validateAndProcessPrerequisites', () => {
	it('creates continuation IDs for chains and branches in tree order', () => {
		const tree = flattenRawSkillTree({ a: { name: 'A' }, b: { name: 'B', prerequisites: ['a'] }, c: { name: 'C', prerequisites: ['a'] }, d: { name: 'D', prerequisites: ['b', 'c'] } })
		validateAndProcessPrerequisites(tree)
		expect(tree.a.continuationIds).toEqual(['b', 'c'])
		expect(tree.b.continuationIds).toEqual(['d'])
		expect(tree.c.continuationIds).toEqual(['d'])
	})

	it('rejects unknown prerequisites before modifying any continuation IDs', () => {
		const tree = flattenRawSkillTree({ a: { name: 'A' }, b: { name: 'B', prerequisites: ['a'] }, c: { name: 'C', prerequisites: ['missing'] } })
		expect(() => validateAndProcessPrerequisites(tree)).toThrow(/missing.*c/)
		expect(tree.a.continuationIds).toEqual([])
	})

	it('rejects direct and longer prerequisite cycles', () => {
		expect(() => validateAndProcessPrerequisites(flattenRawSkillTree({ a: { name: 'A', prerequisites: ['a'] } }))).toThrow('"a" -> "a"')
		expect(() => validateAndProcessPrerequisites(flattenRawSkillTree({ a: { name: 'A', prerequisites: ['b'] }, b: { name: 'B', prerequisites: ['c'] }, c: { name: 'C', prerequisites: ['a'] } }))).toThrow('"a" -> "b" -> "c" -> "a"')
	})
})
