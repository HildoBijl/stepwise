import { deserializeSetup } from '@step-wise/skill-setup'

export function courseRecordToCourseData(record) {
	return {
		learningGoalIds: record.goals,
		startingPointIds: record.startingPoints,
		learningGoalWeights: record.goalWeights ?? undefined,
		blockLearningGoalIds: record.blocks?.map(block => block.goals),
		setup: record.setup == null ? undefined : deserializeSetup(record.setup),
	}
}
