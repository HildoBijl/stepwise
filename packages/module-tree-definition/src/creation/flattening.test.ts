import { describe, expect, it } from 'vitest'

import { and } from '@step-wise/skill-setup'

import { getSkill } from '../searching/validation.ts'

import { flattenModuleTreeDefinition } from './flattening.ts'
import type { ModuleTreeDefinition } from './types.ts'

describe('flattenModuleTreeDefinition', () => {
	it('flattens nested groups and derives paths and group skill IDs', () => {
		const tree = flattenModuleTreeDefinition({ subject: { group: { a: { type: 'skill' }, b: { type: 'skill' } }, c: { type: 'skill' } } })
		expect(Object.keys(tree)).toEqual(['a', 'b', 'c'])
		expect(tree.a).toMatchObject({ id: 'a', groupPath: ['subject', 'group'], groupModuleIds: ['a', 'b'] })
		expect(tree.b.groupModuleIds).toBe(tree.a.groupModuleIds)
		expect(tree.c).toMatchObject({ groupPath: ['subject'], groupModuleIds: ['c'] })
	})

	it('keeps structurally different groups separate when their paths serialize equally', () => {
		const tree = flattenModuleTreeDefinition({ 'a/b': { first: { type: 'skill' } }, a: { b: { second: { type: 'skill' } } } })
		expect(tree.first.groupModuleIds).toEqual(['first'])
		expect(tree.second.groupModuleIds).toEqual(['second'])
		expect(tree.first.groupModuleIds).not.toBe(tree.second.groupModuleIds)
	})

	it('combines and deduplicates explicit and setup-derived prerequisites', () => {
		const setup = and('a', 'b')
		const tree = flattenModuleTreeDefinition({ a: { type: 'skill' }, b: { type: 'skill' }, c: { type: 'skill', prerequisites: ['a'], setup, thresholds: { mastery: 0.7 } } })
		const skill = getSkill(tree, 'c')
		expect(skill.prerequisiteIds).toEqual(['a', 'b'])
		expect(skill.setup).toBe(setup)
		expect(skill.thresholds).toMatchObject({ mastery: 0.7, recap: 0.63, priorKnowledgeMastery: 0.7 })
		expect(skill.thresholds.priorKnowledgeRecap).toBeCloseTo(0.56)
		expect(skill).toMatchObject({ continuationIds: [], linkedSkillIds: [] })
	})

	it('normalizes preliminary links', () => {
		const tree = flattenModuleTreeDefinition({ a: { type: 'skill', links: { skillId: 'b', correlation: 0.5 } }, b: { type: 'skill' } })
		expect(getSkill(tree, 'a').links).toEqual([{ skillIds: ['b'], correlation: 0.5 }])
	})

	it('returns a prototype-free tree and supports special skill IDs', () => {
		const rawTree = Object.create(null) as ModuleTreeDefinition
		Object.defineProperty(rawTree, 'toString', { value: { type: 'skill' }, enumerable: true })
		Object.defineProperty(rawTree, 'constructor', { value: { type: 'skill' }, enumerable: true })
		Object.defineProperty(rawTree, '__proto__', { value: { type: 'skill' }, enumerable: true })
		const tree = flattenModuleTreeDefinition(rawTree)
		expect(Object.getPrototypeOf(tree)).toBeNull()
		expect(Object.keys(tree)).toEqual(['toString', 'constructor', '__proto__'])
	})

	it('allows a group to contain a skill whose ID is name', () => {
		const tree = flattenModuleTreeDefinition({ group: { name: { type: 'skill' }, other: { type: 'skill' } } })
		expect(tree.name.groupPath).toEqual(['group'])
		expect(tree.name.groupModuleIds).toEqual(['name', 'other'])
	})

	it('rejects exact and case-insensitive duplicate IDs with their paths', () => {
		expect(() => flattenModuleTreeDefinition({ first: { a: { type: 'skill' } }, second: { a: { type: 'skill' } } })).toThrow(/first\/a.*second\/a|second\/a.*first\/a/)
		expect(() => flattenModuleTreeDefinition({ first: { Skill: { type: 'skill' } }, second: { skill: { type: 'skill' } } })).toThrow(/regardless of casing/)
	})

	it('rejects empty skill IDs', () => {
		expect(() => flattenModuleTreeDefinition({ '': { type: 'skill' } })).toThrow(RangeError)
	})

	it('rejects skill IDs and references with surrounding whitespace', () => {
		expect(() => flattenModuleTreeDefinition({ ' a': { type: 'skill' } })).toThrow(/start or end with whitespace/)
		expect(() => flattenModuleTreeDefinition({ 'a ': { type: 'skill' } })).toThrow(/start or end with whitespace/)
		expect(() => flattenModuleTreeDefinition({ a: { type: 'skill', prerequisites: [' b'] } })).toThrow(/start or end with whitespace/)
		expect(() => flattenModuleTreeDefinition({ a: { type: 'skill', links: 'b ' } })).toThrow(/start or end with whitespace/)
		expect(() => flattenModuleTreeDefinition({ a: { type: 'skill', setup: and(' b', 'c') } })).toThrow(/start or end with whitespace/)
	})

	it('validates raw skill properties', () => {
		expect(() => flattenModuleTreeDefinition({ a: { type: 'skill', prerequisites: 'b' } } as unknown as ModuleTreeDefinition)).toThrow(/prerequisites.*array/)
		expect(() => flattenModuleTreeDefinition({ a: { type: 'skill', setup: {} } } as unknown as ModuleTreeDefinition)).toThrow(/setup.*SkillSetup/)
		expect(() => flattenModuleTreeDefinition({ a: { type: 'skill', thresholds: 0.5 } } as unknown as ModuleTreeDefinition)).toThrow(/threshold.*plain object/)
	})

	it.each([NaN, -0.1, 1.1, Infinity, '0.5'])('rejects an invalid mastery threshold: %s', mastery => {
		expect(() => flattenModuleTreeDefinition({ a: { type: 'skill', thresholds: { mastery } } } as unknown as ModuleTreeDefinition)).toThrow()
	})

	it.each([0, 0.5, 1])('accepts a mastery threshold on the inclusive unit interval: %s', mastery => {
		const tree = flattenModuleTreeDefinition({ a: { type: 'skill', thresholds: { mastery } } })
		expect(getSkill(tree, 'a').thresholds.mastery).toBe(mastery)
	})

	it('rejects malformed group entries with their path', () => {
		expect(() => flattenModuleTreeDefinition({ group: { broken: 3 } } as unknown as ModuleTreeDefinition)).toThrow(/group\/broken/)
	})
})
