import { describe, expect, it } from 'vitest'

import { createModuleTree } from '../creation/index.ts'

import { expandModuleIdsWithDirectPrerequisites, getRequiredModuleIds, isModuleRequiredFor } from './prerequisites.ts'

const tree = createModuleTree({
	a: { type: 'skill' },
	b: { type: 'skill', prerequisites: ['a'] },
	c: { type: 'skill', prerequisites: ['a'], links: 'd' },
	d: { type: 'skill' },
	e: { type: 'skill', prerequisites: ['b', 'c'] },
	f: { type: 'skill' },
})

describe('module prerequisite helpers', () => {
	const mixedTree = createModuleTree({
		foundation: { type: 'concept' },
		method: { type: 'skill', prerequisites: ['foundation'] },
		application: { type: 'skill', prerequisites: ['method'] },
	})

	it('traverses prerequisites of either module type', () => {
		expect(isModuleRequiredFor(mixedTree, 'foundation', 'application')).toBe(true)
		expect(expandModuleIdsWithDirectPrerequisites(mixedTree, ['method'])).toEqual(['method', 'foundation'])
		expect(getRequiredModuleIds(mixedTree, ['application'])).toEqual(['application', 'method', 'foundation'])
	})

	it('can exclude concepts and stop traversing their prerequisites', () => {
		expect(expandModuleIdsWithDirectPrerequisites(mixedTree, ['method'], { includeConcepts: false })).toEqual(['method'])
		expect(getRequiredModuleIds(mixedTree, ['application'], { includeConcepts: false })).toEqual(['application', 'method'])
	})
})

describe('isModuleRequiredFor', () => {
	it('recognizes direct, transitive, and self prerequisites', () => {
		expect(isModuleRequiredFor(tree, 'a', 'b')).toBe(true)
		expect(isModuleRequiredFor(tree, 'a', 'e')).toBe(true)
		expect(isModuleRequiredFor(tree, 'e', 'e')).toBe(true)
	})

	it('returns false for unrelated or reversed modules', () => {
		expect(isModuleRequiredFor(tree, 'f', 'e')).toBe(false)
		expect(isModuleRequiredFor(tree, 'e', 'a')).toBe(false)
	})

	it('requires exact casing and rejects unknown IDs', () => {
		expect(() => isModuleRequiredFor(tree, 'A', 'E')).toThrow(/A/)
		expect(() => isModuleRequiredFor(tree, 'missing', 'missing')).toThrow(/missing/)
	})
})

describe('expandModuleIdsWithDirectPrerequisites', () => {
	it('includes requested IDs and only their direct prerequisites', () => {
		expect(expandModuleIdsWithDirectPrerequisites(tree, ['e'])).toEqual(['e', 'b', 'c'])
		expect(expandModuleIdsWithDirectPrerequisites(tree, ['e', 'b'])).toEqual(['e', 'b', 'c', 'a'])
	})

	it('deduplicates shared prerequisites', () => {
		expect(expandModuleIdsWithDirectPrerequisites(tree, ['b', 'c'])).toEqual(['b', 'a', 'c'])
	})

	it('optionally includes linked skills without recursion', () => {
		expect(expandModuleIdsWithDirectPrerequisites(tree, ['c'], { includeLinkedSkills: true })).toEqual(['c', 'a', 'd'])
		expect(expandModuleIdsWithDirectPrerequisites(tree, ['e'], { includeLinkedSkills: true })).toEqual(['e', 'b', 'c'])
	})

	it('deduplicates overlap between prerequisites and linked skills', () => {
		expect(expandModuleIdsWithDirectPrerequisites(tree, ['c', 'd'], { includeLinkedSkills: true })).toEqual(['c', 'a', 'd'])
	})
})

describe('getRequiredModuleIds', () => {
	it('includes supplied modules and recursive prerequisites while excluding the prior-knowledge boundary', () => {
		expect(getRequiredModuleIds(tree, ['e'], { priorKnowledgeIds: ['a'] })).toEqual(['e', 'b', 'c'])
	})

	it('does not traverse beyond an excluded prior-knowledge skill', () => {
		expect(getRequiredModuleIds(tree, ['e'], { priorKnowledgeIds: ['b'] })).toEqual(['e', 'c', 'a'])
	})

	it('handles multiple modules, shared branches, and duplicates', () => {
		expect(getRequiredModuleIds(tree, ['e', 'b'])).toEqual(['e', 'b', 'a', 'c'])
	})

	it('rejects unknown module and prior-knowledge IDs', () => {
		expect(() => getRequiredModuleIds(tree, ['missing'])).toThrow(/missing/)
		expect(() => getRequiredModuleIds(tree, ['e'], { priorKnowledgeIds: ['missing'] })).toThrow(/missing/)
	})
})
