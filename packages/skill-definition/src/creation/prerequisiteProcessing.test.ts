import { describe, expect, it } from 'vitest'

import { flattenRawSkillTree } from './flattening'
import { processPrerequisites } from './prerequisiteProcessing'

describe('processPrerequisites', () => {
	it('creates continuation IDs for chains and branches in tree order', () => {
		const tree = flattenRawSkillTree({ a: { name: 'A' }, b: { name: 'B', prerequisites: ['a'] }, c: { name: 'C', prerequisites: ['a'] }, d: { name: 'D', prerequisites: ['b', 'c'] } })
		processPrerequisites(tree)
		expect(tree.a.continuationIds).toEqual(['b', 'c'])
		expect(tree.b.continuationIds).toEqual(['d'])
		expect(tree.c.continuationIds).toEqual(['d'])
	})

	it('rejects unknown prerequisites before modifying any continuation IDs', () => {
		const tree = flattenRawSkillTree({ a: { name: 'A' }, b: { name: 'B', prerequisites: ['a'] }, c: { name: 'C', prerequisites: ['missing'] } })
		expect(() => processPrerequisites(tree)).toThrow(/missing.*c/)
		expect(tree.a.continuationIds).toEqual([])
	})

	it('rejects direct and longer prerequisite cycles', () => {
		expect(() => processPrerequisites(flattenRawSkillTree({ a: { name: 'A', prerequisites: ['a'] } }))).toThrow('"a" -> "a"')
		expect(() => processPrerequisites(flattenRawSkillTree({ a: { name: 'A', prerequisites: ['b'] }, b: { name: 'B', prerequisites: ['c'] }, c: { name: 'C', prerequisites: ['a'] } }))).toThrow('"a" -> "b" -> "c" -> "a"')
	})
})
