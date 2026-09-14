import { describe, expect, it } from 'vitest'

import { createModuleTree } from '../creation/index.ts'

import { expandModuleIdsWithDirectPrerequisites, expandSkillIdsWithDirectPrerequisites, expandSkillIdsWithDirectPrerequisitesAndLinks, getModuleIdsBetweenGoalsAndPriorKnowledge, getSkillIdsBetweenGoalsAndPriorKnowledge, isModulePrerequisiteOf, isSkillPrerequisiteOf } from './prerequisites.ts'

const tree = createModuleTree({
	a: { type: 'skill', name: 'A' },
	b: { type: 'skill', name: 'B', prerequisites: ['a'] },
	c: { type: 'skill', name: 'C', prerequisites: ['a'], links: 'd' },
	d: { type: 'skill', name: 'D' },
	e: { type: 'skill', name: 'E', prerequisites: ['b', 'c'] },
	f: { type: 'skill', name: 'F' },
})

describe('module prerequisite helpers', () => {
	const mixedTree = createModuleTree({
		foundation: { type: 'concept', name: 'Foundation' },
		method: { type: 'skill', name: 'Method', prerequisites: ['foundation'] },
		application: { type: 'skill', name: 'Application', prerequisites: ['method'] },
	})

	it('traverses prerequisites of either module type', () => {
		expect(isModulePrerequisiteOf(mixedTree, 'foundation', 'application')).toBe(true)
		expect(expandModuleIdsWithDirectPrerequisites(mixedTree, ['method'])).toEqual(['method', 'foundation'])
		expect(getModuleIdsBetweenGoalsAndPriorKnowledge(mixedTree, ['application'], [])).toEqual(['application', 'method', 'foundation'])
	})

	it('keeps concepts out of skill-only expansions', () => {
		expect(expandSkillIdsWithDirectPrerequisites(mixedTree, ['method'])).toEqual(['method'])
		expect(expandSkillIdsWithDirectPrerequisitesAndLinks(mixedTree, ['method'])).toEqual(['method'])
	})
})

describe('isSkillPrerequisiteOf', () => {
	it('recognizes direct, transitive, and self prerequisites', () => {
		expect(isSkillPrerequisiteOf(tree, 'a', 'b')).toBe(true)
		expect(isSkillPrerequisiteOf(tree, 'a', 'e')).toBe(true)
		expect(isSkillPrerequisiteOf(tree, 'e', 'e')).toBe(true)
	})

	it('returns false for unrelated or reversed skills', () => {
		expect(isSkillPrerequisiteOf(tree, 'f', 'e')).toBe(false)
		expect(isSkillPrerequisiteOf(tree, 'e', 'a')).toBe(false)
	})

	it('requires exact casing and rejects unknown IDs', () => {
		expect(() => isSkillPrerequisiteOf(tree, 'A', 'E')).toThrow(/A/)
		expect(() => isSkillPrerequisiteOf(tree, 'missing', 'missing')).toThrow(/missing/)
	})
})

describe('expandSkillIdsWithDirectPrerequisites', () => {
	it('includes requested IDs and only their direct prerequisites', () => {
		expect(expandSkillIdsWithDirectPrerequisites(tree, ['e'])).toEqual(['e', 'b', 'c'])
		expect(expandSkillIdsWithDirectPrerequisites(tree, ['e', 'b'])).toEqual(['e', 'b', 'c', 'a'])
	})

	it('deduplicates shared prerequisites', () => {
		expect(expandSkillIdsWithDirectPrerequisites(tree, ['b', 'c'])).toEqual(['b', 'a', 'c'])
	})
})

describe('expandSkillIdsWithDirectPrerequisitesAndLinks', () => {
	it('includes direct prerequisites and linked skills without recursion', () => {
		expect(expandSkillIdsWithDirectPrerequisitesAndLinks(tree, ['c'])).toEqual(['c', 'a', 'd'])
		expect(expandSkillIdsWithDirectPrerequisitesAndLinks(tree, ['e'])).toEqual(['e', 'b', 'c'])
	})

	it('deduplicates overlap across multiple requested skills', () => {
		expect(expandSkillIdsWithDirectPrerequisitesAndLinks(tree, ['c', 'd'])).toEqual(['c', 'a', 'd'])
	})
})

describe('getSkillIdsBetweenGoalsAndPriorKnowledge', () => {
	it('includes goals and recursive prerequisites while excluding the prior-knowledge boundary', () => {
		expect(getSkillIdsBetweenGoalsAndPriorKnowledge(tree, ['e'], ['a'])).toEqual(['e', 'b', 'c'])
	})

	it('does not traverse beyond an excluded prior-knowledge skill', () => {
		expect(getSkillIdsBetweenGoalsAndPriorKnowledge(tree, ['e'], ['b'])).toEqual(['e', 'c', 'a'])
	})

	it('handles multiple goals, shared branches, and duplicates', () => {
		expect(getSkillIdsBetweenGoalsAndPriorKnowledge(tree, ['e', 'b'], [])).toEqual(['e', 'b', 'a', 'c'])
	})

	it('rejects unknown goals and prior-knowledge IDs', () => {
		expect(() => getSkillIdsBetweenGoalsAndPriorKnowledge(tree, ['missing'], [])).toThrow(/missing/)
		expect(() => getSkillIdsBetweenGoalsAndPriorKnowledge(tree, ['e'], ['missing'])).toThrow(/missing/)
	})
})
