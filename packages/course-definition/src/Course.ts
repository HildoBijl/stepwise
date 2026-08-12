import type { SkillId, SkillSetup } from '@step-wise/skill-setup'
import type { SkillTree } from '@step-wise/skill-definition'

import type { CourseAnalysis, CourseData, CourseDiagnostics, ResolvedCourse, ResolvedCourseBlock } from './types'
import { ensureCourseData } from './checks'
import { analyzeCourse } from './analyzeCourse'

export class Course {
	readonly skillTree: SkillTree
	readonly data: CourseData

	private _analysis?: CourseAnalysis

	constructor(skillTree: SkillTree, data: CourseData) {
		this.skillTree = skillTree
		this.data = ensureCourseData(data)
	}

	get analysis(): CourseAnalysis {
		return this._analysis ??= analyzeCourse(this.skillTree, this.data)
	}

	/*
	 * Course properties
	 */

	get course(): ResolvedCourse {
		return this.analysis.course
	}

	get priorKnowledge(): readonly SkillId[] {
		return this.course.priorKnowledge
	}

	get startingPoints(): readonly SkillId[] {
		return this.course.startingPoints
	}

	get contents(): readonly SkillId[] {
		return this.course.contents
	}

	get allSkills(): readonly SkillId[] {
		return this.course.allSkills
	}

	get learningGoals(): readonly SkillId[] {
		return this.course.learningGoals
	}

	get learningGoalWeights(): readonly number[] {
		return this.course.learningGoalWeights
	}

	get blocks(): readonly ResolvedCourseBlock[] | undefined {
		return this.course.blocks
	}

	get setup(): SkillSetup | undefined {
		return this.course.setup
	}

	/*
	 * Derived helpers
	 */

	hasSkill(skillId: SkillId): boolean {
		return this.contents.includes(skillId)
	}

	hasPriorKnowledge(skillId: SkillId): boolean {
		return this.priorKnowledge.includes(skillId)
	}

	hasStartingPoint(skillId: SkillId): boolean {
		return this.startingPoints.includes(skillId)
	}

	hasLearningGoal(skillId: SkillId): boolean {
		return this.learningGoals.includes(skillId)
	}

	getLearningGoalWeight(skillId: SkillId): number {
		const index = this.learningGoals.indexOf(skillId)
		return index === -1 ? 0 : this.learningGoalWeights[index]
	}

	/*
	 * Diagnostics properties
	 */

	get diagnostics(): CourseDiagnostics {
		return this.analysis.diagnostics
	}
}
