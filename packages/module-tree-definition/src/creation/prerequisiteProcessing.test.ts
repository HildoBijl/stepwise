import { describe, expect, it } from 'vitest'

import { flattenModuleTreeDefinition } from './flattening.ts'
import { validateAndProcessPrerequisites } from './prerequisiteProcessing.ts'

describe('validateAndProcessPrerequisites', () => {
	it('creates continuation IDs for chains and branches in tree order', () => {
		const tree = flattenModuleTreeDefinition({ a: { type: 'skill', name: 'A' }, b: { type: 'skill', name: 'B', prerequisites: ['a'] }, c: { type: 'skill', name: 'C', prerequisites: ['a'] }, d: { type: 'skill', name: 'D', prerequisites: ['b', 'c'] } })
		validateAndProcessPrerequisites(tree)
		expect(tree.a.continuationIds).toEqual(['b', 'c'])
		expect(tree.b.continuationIds).toEqual(['d'])
		expect(tree.c.continuationIds).toEqual(['d'])
	})

	it('rejects unknown prerequisites before modifying any continuation IDs', () => {
		const tree = flattenModuleTreeDefinition({ a: { type: 'skill', name: 'A' }, b: { type: 'skill', name: 'B', prerequisites: ['a'] }, c: { type: 'skill', name: 'C', prerequisites: ['missing'] } })
		expect(() => validateAndProcessPrerequisites(tree)).toThrow(/missing.*c/)
		expect(tree.a.continuationIds).toEqual([])
	})

	it('rejects direct and longer prerequisite cycles', () => {
		expect(() => validateAndProcessPrerequisites(flattenModuleTreeDefinition({ a: { type: 'skill', name: 'A', prerequisites: ['a'] } }))).toThrow('"a" -> "a"')
		expect(() => validateAndProcessPrerequisites(flattenModuleTreeDefinition({ a: { type: 'skill', name: 'A', prerequisites: ['b'] }, b: { type: 'skill', name: 'B', prerequisites: ['c'] }, c: { type: 'skill', name: 'C', prerequisites: ['a'] } }))).toThrow('"a" -> "b" -> "c" -> "a"')
	})
})
