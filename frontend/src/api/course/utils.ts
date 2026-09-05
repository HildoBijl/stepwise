import { type SkillId, deserializeSetup } from '@step-wise/skill-setup'
import { Course } from '@step-wise/course-definition'
import { skillTree } from '@step-wise/skill-tree'

type CourseRecord = {
	goals: readonly SkillId[]
	goalWeights?: readonly number[] | null
	startingPoints: readonly SkillId[]
	setup?: unknown
	blocks?: readonly { goals: readonly SkillId[] }[] | null
}

export function courseRecordToCourse(record: CourseRecord): Course {
	return new Course(skillTree, {
		learningGoalIds: record.goals,
		startingPointIds: record.startingPoints,
		...(record.goalWeights == null ? {} : { learningGoalWeights: record.goalWeights }),
		...(record.blocks == null ? {} : { blockLearningGoalIds: record.blocks.map(block => block.goals) }),
		...(record.setup == null ? {} : { setup: deserializeSetup(record.setup) }),
	})
}
