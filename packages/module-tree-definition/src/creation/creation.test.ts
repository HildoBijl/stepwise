import { describe, expect, it } from 'vitest'

import { skill } from '@step-wise/skill-setup'

import type { ModuleTreeDefinition } from './types.ts'
import { createModuleTree } from './creation.ts'

describe('createModuleTree', () => {
	it('creates a complete module tree from a nested definition', () => {
		const setup = skill('foundation')
		const tree = createModuleTree({
			basics: { foundation: { type: 'skill', name: 'Foundation', thresholds: { mastery: 0.6 } }, intermediate: { type: 'skill', name: 'Intermediate', setup } },
			advanced: { type: 'skill', name: 'Advanced', prerequisites: ['intermediate'], links: { skillId: 'foundation', correlation: 0.5 } },
		})
		expect(Object.getPrototypeOf(tree)).toBeNull()
		expect(tree.foundation).toMatchObject({ groupPath: ['basics'], groupModuleIds: ['foundation', 'intermediate'], continuationIds: ['intermediate'], linkedSkillIds: ['advanced'], thresholds: { mastery: 0.6 } })
		expect(tree.intermediate).toMatchObject({ prerequisiteIds: ['foundation'], continuationIds: ['advanced'] })
		expect(tree.advanced).toMatchObject({ prerequisiteIds: ['intermediate'], links: [{ skillIds: ['foundation'], correlation: 0.5 }] })
	})

	it('creates concepts and permits every valid prerequisite combination', () => {
		const tree = createModuleTree({
			foundation: { type: 'concept', name: 'Foundation' },
			advancedConcept: { type: 'concept', name: 'Advanced concept', prerequisites: ['foundation'] },
			basicSkill: { type: 'skill', name: 'Basic skill', prerequisites: ['foundation'] },
			advancedSkill: { type: 'skill', name: 'Advanced skill', prerequisites: ['advancedConcept', 'basicSkill'] },
		})

		expect(tree.foundation).toMatchObject({ type: 'concept', continuationIds: ['advancedConcept', 'basicSkill'] })
		expect(tree.advancedConcept).toMatchObject({ type: 'concept', prerequisiteIds: ['foundation'], continuationIds: ['advancedSkill'] })
		expect(tree.advancedSkill).toMatchObject({ type: 'skill', prerequisiteIds: ['advancedConcept', 'basicSkill'] })
	})

	it('rejects concepts that depend on skills', () => {
		expect(() => createModuleTree({
			skill: { type: 'skill', name: 'Skill' },
			concept: { type: 'concept', name: 'Concept', prerequisites: ['skill'] },
		})).toThrow('concepts cannot depend on skills')
	})

	it.each([
		['setup', 'a skill setup'],
		['links', 'skill links'],
		['thresholds', 'skill thresholds'],
	] as const)('rejects the skill-only %s property on concepts', (property, description) => {
		expect(() => createModuleTree({
			concept: { type: 'concept', name: 'Concept', [property]: {} },
		} as unknown as ModuleTreeDefinition)).toThrow(`concepts cannot define ${description}`)
	})

	it('rejects errors from every creation phase', () => {
		expect(() => createModuleTree({ a: { type: 'skill', name: '' } })).toThrow()
		expect(() => createModuleTree({ a: { type: 'skill', name: 'A', prerequisites: ['missing'] } })).toThrow()
		expect(() => createModuleTree({ a: { type: 'skill', name: 'A', links: 'missing' } })).toThrow()
	})

	it('requires exact casing for prerequisite, setup and link references', () => {
		expect(() => createModuleTree({ Alpha: { type: 'skill', name: 'Alpha' }, beta: { type: 'skill', name: 'Beta', prerequisites: ['ALPHA'] } })).toThrow(/ALPHA/)
		expect(() => createModuleTree({ Alpha: { type: 'skill', name: 'Alpha' }, beta: { type: 'skill', name: 'Beta', setup: skill('ALPHA') } })).toThrow(/ALPHA/)
		expect(() => createModuleTree({ Alpha: { type: 'skill', name: 'Alpha' }, beta: { type: 'skill', name: 'Beta', links: 'ALPHA' } })).toThrow(/ALPHA/)
	})
})
