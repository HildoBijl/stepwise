import type { SkillId, SkillSetup } from '@step-wise/skill-setup'
import type { SkillTree } from '@step-wise/skill-definition'

import type { CourseAnalysis, CourseDiagnostics, CourseResolution, CourseResolutionBlock, CourseSpecification } from './types.ts'
import { ensureCourseSpecification } from './dataValidation.ts'
import { analyzeCourse } from './analyzeCourse.ts'

export class CourseDefinition {
	readonly skillTree: SkillTree
	readonly specification: CourseSpecification

	private _analysis?: CourseAnalysis

	constructor(skillTree: SkillTree, specification: CourseSpecification) {
		this.skillTree = skillTree
		this.specification = ensureCourseSpecification(specification)
	}

	get analysis(): CourseAnalysis {
		return this._analysis ??= analyzeCourse(this.skillTree, this.specification)
	}

	/*
	 * Course properties
	 */

	get resolution(): CourseResolution {
		return this.analysis.resolution
	}

	get priorKnowledgeIds(): readonly SkillId[] {
		return this.resolution.priorKnowledgeIds
	}

	get startingPointIds(): readonly SkillId[] {
		return this.resolution.startingPointIds
	}

	get contentSkillIds(): readonly SkillId[] {
		return this.resolution.contentSkillIds
	}

	get allSkillIds(): readonly SkillId[] {
		return this.resolution.allSkillIds
	}

	get learningGoalIds(): readonly SkillId[] {
		return this.resolution.learningGoalIds
	}

	get learningGoalWeights(): readonly number[] {
		return this.resolution.learningGoalWeights
	}

	get blocks(): readonly CourseResolutionBlock[] | undefined {
		return this.resolution.blocks
	}

	get setup(): SkillSetup | undefined {
		return this.resolution.setup
	}

	/*
	 * Derived helpers
	 */

	hasAsContents(skillId: SkillId): boolean {
		return this.contentSkillIds.includes(skillId)
	}

	hasAsPriorKnowledge(skillId: SkillId): boolean {
		return this.priorKnowledgeIds.includes(skillId)
	}

	hasAsStartingPoint(skillId: SkillId): boolean {
		return this.startingPointIds.includes(skillId)
	}

	hasAsLearningGoal(skillId: SkillId): boolean {
		return this.learningGoalIds.includes(skillId)
	}

	getLearningGoalWeight(skillId: SkillId): number {
		const index = this.learningGoalIds.indexOf(skillId)
		return index === -1 ? 0 : this.learningGoalWeights[index]
	}

	/*
	 * Diagnostics properties
	 */

	get diagnostics(): CourseDiagnostics {
		return this.analysis.diagnostics
	}
}
