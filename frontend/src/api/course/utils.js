import { deserializeSetup } from '@step-wise/skill-setup'

export function courseRecordToCourseData(record) {
	return {
		learningGoals: record.goals,
		startingPoints: record.startingPoints,
		goalWeights: record.goalWeights,
		blockGoals: record.blocks?.map(block => block.goals),
		setup: record.setup && deserializeSetup(record.setup),
	}
}
