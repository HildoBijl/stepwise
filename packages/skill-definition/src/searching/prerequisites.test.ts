import { describe, expect, it } from 'vitest'

import { createSkillTree } from '../creation'

import { getSkillIdsBetweenGoalsAndPriorKnowledge, getSkillIdsWithDirectPrerequisites, getSkillIdsWithDirectPrerequisitesAndLinks, isSkillPrerequisiteFor } from './prerequisites'

const tree = createSkillTree({
	a: { name: 'A' },
	b: { name: 'B', prerequisites: ['a'] },
	c: { name: 'C', prerequisites: ['a'], links: 'd' },
	d: { name: 'D' },
	e: { name: 'E', prerequisites: ['b', 'c'] },
	f: { name: 'F' },
})

describe('isSkillPrerequisiteFor', () => {
	it('recognizes direct, transitive, and self prerequisites', () => {
		expect(isSkillPrerequisiteFor(tree, 'a', 'b')).toBe(true)
		expect(isSkillPrerequisiteFor(tree, 'a', 'e')).toBe(true)
		expect(isSkillPrerequisiteFor(tree, 'e', 'e')).toBe(true)
	})

	it('returns false for unrelated or reversed skills', () => {
		expect(isSkillPrerequisiteFor(tree, 'f', 'e')).toBe(false)
		expect(isSkillPrerequisiteFor(tree, 'e', 'a')).toBe(false)
	})

	it('normalizes casing and rejects unknown IDs', () => {
		expect(isSkillPrerequisiteFor(tree, 'A', 'E')).toBe(true)
		expect(() => isSkillPrerequisiteFor(tree, 'missing', 'missing')).toThrow(/missing/)
	})
})

describe('getSkillIdsWithDirectPrerequisites', () => {
	it('includes requested IDs and only their direct prerequisites', () => {
		expect(getSkillIdsWithDirectPrerequisites(tree, ['e'])).toEqual(['e', 'b', 'c'])
		expect(getSkillIdsWithDirectPrerequisites(tree, ['E', 'b'])).toEqual(['e', 'b', 'c', 'a'])
	})

	it('deduplicates shared prerequisites', () => {
		expect(getSkillIdsWithDirectPrerequisites(tree, ['b', 'c'])).toEqual(['b', 'a', 'c'])
	})
})

describe('getSkillIdsWithDirectPrerequisitesAndLinks', () => {
	it('includes direct prerequisites and linked skills without recursion', () => {
		expect(getSkillIdsWithDirectPrerequisitesAndLinks(tree, ['c'])).toEqual(['c', 'a', 'd'])
		expect(getSkillIdsWithDirectPrerequisitesAndLinks(tree, ['e'])).toEqual(['e', 'b', 'c'])
	})

	it('deduplicates overlap across multiple requested skills', () => {
		expect(getSkillIdsWithDirectPrerequisitesAndLinks(tree, ['c', 'd'])).toEqual(['c', 'a', 'd'])
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
