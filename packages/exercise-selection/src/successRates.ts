import { type SkillId, ensureSetup } from '@step-wise/skill-setup'
import { type SkillLevelSet } from '@step-wise/skill-tracking'
import { type ExerciseMetadata } from '@step-wise/exercise-definition'

// Calculate success rates for a list of exercises.
export async function getExerciseSuccessRates(exerciseMetadataList: ExerciseMetadata[], getSkillLevelSet: (skillIds: SkillId[]) => Promise<SkillLevelSet>): Promise<number[]> {
	// Figure out all the skills that need to be loaded and load them.
	const exerciseSkillIds = new Set<SkillId>()
	exerciseMetadataList.forEach(exerciseMetadata => {
		; (['skill', 'setup'] as const).forEach(item => {
			if (exerciseMetadata[item]) ensureSetup(exerciseMetadata[item]).getSkillList().forEach(skillId => exerciseSkillIds.add(skillId))
		})
	})
	const skillLevelSet = await getSkillLevelSet([...exerciseSkillIds])

	// Walk through the exercises to calculate success rates.
	return exerciseMetadataList.map(exerciseMetadata => skillLevelSet.getSetupsExpectedValues([exerciseMetadata.skill, exerciseMetadata.setup], [undefined, exerciseMetadata.setupInferenceOrder]))
}
