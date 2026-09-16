import { describe, expect, it } from 'vitest'

import { flattenModuleTreeDefinition } from './flattening.ts'
import { validateAndProcessPrerequisites } from './prerequisiteProcessing.ts'

describe('validateAndProcessPrerequisites', () => {
	it('creates continuation IDs for chains and branches in tree order', () => {
		const tree = flattenModuleTreeDefinition({ a: { type: 'skill' }, b: { type: 'skill', prerequisites: ['a'] }, c: { type: 'skill', prerequisites: ['a'] }, d: { type: 'skill', prerequisites: ['b', 'c'] } })
		validateAndProcessPrerequisites(tree)
		expect(tree.a.continuationIds).toEqual(['b', 'c'])
		expect(tree.b.continuationIds).toEqual(['d'])
		expect(tree.c.continuationIds).toEqual(['d'])
	})

	it('rejects unknown prerequisites before modifying any continuation IDs', () => {
		const tree = flattenModuleTreeDefinition({ a: { type: 'skill' }, b: { type: 'skill', prerequisites: ['a'] }, c: { type: 'skill', prerequisites: ['missing'] } })
		expect(() => validateAndProcessPrerequisites(tree)).toThrow(/missing.*c/)
		expect(tree.a.continuationIds).toEqual([])
	})

	it('rejects direct and longer prerequisite cycles', () => {
		expect(() => validateAndProcessPrerequisites(flattenModuleTreeDefinition({ a: { type: 'skill', prerequisites: ['a'] } }))).toThrow('"a" -> "a"')
		expect(() => validateAndProcessPrerequisites(flattenModuleTreeDefinition({ a: { type: 'skill', prerequisites: ['b'] }, b: { type: 'skill', prerequisites: ['c'] }, c: { type: 'skill', prerequisites: ['a'] } }))).toThrow('"a" -> "b" -> "c" -> "a"')
	})
})
