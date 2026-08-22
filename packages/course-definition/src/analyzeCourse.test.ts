import { describe, expect, it } from 'vitest'
import { and } from '@step-wise/skill-setup'
import { type SkillTree, createSkillTree } from '@step-wise/skill-definition'

import { analyzeCourse } from './analyzeCourse'

const skillTree = createSkillTree({
	a: { name: 'A' },
	b: { name: 'B', prerequisites: ['a'] },
	c: { name: 'C', prerequisites: ['b'] },
	d: { name: 'D' },
	e: { name: 'E', prerequisites: ['c', 'd'] },
	f: { name: 'F', prerequisites: ['b'] },
})

describe('analyzeCourse', () => {
	it('resolves a linear course', () => {
		const { resolution, diagnostics } = analyzeCourse(skillTree, { startingPointIds: ['a'], learningGoalIds: ['c'] })

		expect(resolution).toMatchObject({ priorKnowledgeIds: [], startingPointIds: ['a'], contentSkillIds: ['a', 'b', 'c'], allSkillIds: ['a', 'b', 'c'], learningGoalIds: ['c'], learningGoalWeights: [1] })
		expect(diagnostics.missingStartingPointIds).toEqual([])
	})

	it('derives prior knowledge before a starting point', () => {
		const { resolution } = analyzeCourse(skillTree, { startingPointIds: ['b'], learningGoalIds: ['c'] })

		expect(resolution.priorKnowledgeIds).toEqual(['a'])
		expect(resolution.contentSkillIds).toEqual(['b', 'c'])
		expect(resolution.allSkillIds).toEqual(['a', 'b', 'c'])
	})

	it('diagnoses a branch not reached by a starting point', () => {
		const { resolution, diagnostics } = analyzeCourse(skillTree, { startingPointIds: ['a'], learningGoalIds: ['e'] })

		expect(diagnostics.missingStartingPointIds).toEqual(['e'])
		expect(resolution.startingPointIds).toEqual(['a', 'e'])
		expect(resolution.priorKnowledgeIds).toEqual(['d'])
	})

	it('diagnoses an unreachable top-level goal and an unrelated starting point', () => {
		const { diagnostics } = analyzeCourse(skillTree, { startingPointIds: ['d'], learningGoalIds: ['c'] })

		expect(diagnostics.missingStartingPointIds).toEqual(['c'])
		expect(diagnostics.externalStartingPointIds).toEqual(['d'])
	})

	it('diagnoses redundant starting points', () => {
		const { resolution, diagnostics } = analyzeCourse(skillTree, { startingPointIds: ['a', 'b'], learningGoalIds: ['c'] })

		expect(diagnostics.redundantStartingPointIds).toEqual(['b'])
		expect(resolution.startingPointIds).toEqual(['a'])
	})

	it('diagnoses redundant learning goals independently of their order', () => {
		const first = analyzeCourse(skillTree, { startingPointIds: ['a'], learningGoalIds: ['b', 'c'] })
		const second = analyzeCourse(skillTree, { startingPointIds: ['a'], learningGoalIds: ['c', 'b'] })

		expect(first.diagnostics.redundantLearningGoalIds).toEqual(['b'])
		expect(second.diagnostics.redundantLearningGoalIds).toEqual(['b'])
	})

	it('filters unknown endpoints and retains the weights of known goals', () => {
		const { resolution, diagnostics } = analyzeCourse(skillTree, { startingPointIds: ['a', 'unknownStart'], learningGoalIds: ['unknownGoal', 'c'], learningGoalWeights: [2, 3] })

		expect(diagnostics.unknownStartingPointIds).toEqual(['unknownStart'])
		expect(diagnostics.unknownLearningGoalIds).toEqual(['unknownGoal'])
		expect(resolution.learningGoalIds).toEqual(['c'])
		expect(resolution.learningGoalWeights).toEqual([3])
	})

	it('sorts course contents into blocks', () => {
		const { resolution, diagnostics } = analyzeCourse(skillTree, { startingPointIds: ['a'], learningGoalIds: ['c'], blockLearningGoalIds: [['b'], ['c']] })

		expect(resolution.blocks).toEqual([
			{ learningGoalIds: ['b'], contentSkillIds: ['a', 'b'] },
			{ learningGoalIds: ['c'], contentSkillIds: ['c'] },
		])
		expect(resolution.contentSkillIds).toEqual(['a', 'b', 'c'])
		expect(diagnostics.uncoveredLearningGoalIds).toEqual([])
	})

	it('diagnoses invalid and redundant block learning goals', () => {
		const { diagnostics } = analyzeCourse(skillTree, { startingPointIds: ['a'], learningGoalIds: ['c'], blockLearningGoalIds: [['b'], ['b', 'd', 'unknown'], ['c']] })

		expect(diagnostics.blockDiagnostics?.[1]).toEqual({ unknownLearningGoalIds: ['unknown'], externalLearningGoalIds: ['d'], redundantLearningGoalIds: ['b'] })
	})

	it('diagnoses learning goals not covered by blocks', () => {
		const { diagnostics } = analyzeCourse(skillTree, { startingPointIds: ['a'], learningGoalIds: ['c'], blockLearningGoalIds: [['b']] })

		expect(diagnostics.uncoveredLearningGoalIds).toEqual(['c'])
	})

	it('diagnoses unknown and external setup skills', () => {
		const { diagnostics } = analyzeCourse(skillTree, { startingPointIds: ['a'], learningGoalIds: ['c'], setup: and('b', 'd', 'unknown') })

		expect(diagnostics.unknownSetupSkillIds).toEqual(['unknown'])
		expect(diagnostics.externalSetupSkillIds).toEqual(['d'])
	})

	it('does not treat inherited object properties as skills', () => {
		const ordinaryTree = { a: skillTree.a } as SkillTree
		const { diagnostics } = analyzeCourse(ordinaryTree, { startingPointIds: [], learningGoalIds: ['constructor'] })

		expect(diagnostics.unknownLearningGoalIds).toEqual(['constructor'])
	})
})
