import { describe, expect, it } from 'vitest'

import { createSkillTree } from '../creation'

import { getSkillIdsBetweenGoalsAndPriorKnowledge, expandSkillIdsWithDirectPrerequisites, expandSkillIdsWithDirectPrerequisitesAndLinks, isSkillPrerequisiteOf } from './prerequisites'

const tree = createSkillTree({
	a: { name: 'A' },
	b: { name: 'B', prerequisites: ['a'] },
	c: { name: 'C', prerequisites: ['a'], links: 'd' },
	d: { name: 'D' },
	e: { name: 'E', prerequisites: ['b', 'c'] },
	f: { name: 'F' },
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

	it('normalizes casing and rejects unknown IDs', () => {
		expect(isSkillPrerequisiteOf(tree, 'A', 'E')).toBe(true)
		expect(() => isSkillPrerequisiteOf(tree, 'missing', 'missing')).toThrow(/missing/)
	})
})

describe('expandSkillIdsWithDirectPrerequisites', () => {
	it('includes requested IDs and only their direct prerequisites', () => {
		expect(expandSkillIdsWithDirectPrerequisites(tree, ['e'])).toEqual(['e', 'b', 'c'])
		expect(expandSkillIdsWithDirectPrerequisites(tree, ['E', 'b'])).toEqual(['e', 'b', 'c', 'a'])
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

	it('handles multiple goals, shared branches, casing, and duplicates', () => {
		expect(getSkillIdsBetweenGoalsAndPriorKnowledge(tree, ['E', 'b'], [])).toEqual(['e', 'b', 'a', 'c'])
	})

	it('rejects unknown goals and prior-knowledge IDs', () => {
		expect(() => getSkillIdsBetweenGoalsAndPriorKnowledge(tree, ['missing'], [])).toThrow(/missing/)
		expect(() => getSkillIdsBetweenGoalsAndPriorKnowledge(tree, ['e'], ['missing'])).toThrow(/missing/)
	})
})
