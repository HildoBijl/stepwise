import { type SkillId, ensureSetup } from '@step-wise/skill-setup'
import { type SkillLevelSet } from '@step-wise/skill-tracking'
import { type ExerciseMetadata, resolveExerciseMetadata } from '@step-wise/exercise-definition'

// Calculate success rates for a list of exercises.
export async function getExerciseSuccessRates(exerciseMetadataList: ExerciseMetadata[], getSkillLevelSet: (skillIds: SkillId[]) => Promise<SkillLevelSet>): Promise<number[]> {
	const resolvedMetadataList = exerciseMetadataList.map(resolveExerciseMetadata)

	// Figure out all the skills that need to be loaded and load them.
	const exerciseSkillIds = new Set<SkillId>()
	resolvedMetadataList.forEach(exerciseMetadata => {
		; (['skill', 'setup'] as const).forEach(item => {
			if (exerciseMetadata[item] !== undefined) ensureSetup(exerciseMetadata[item]).getSkillList().forEach(skillId => exerciseSkillIds.add(skillId))
		})
	})
	if (exerciseSkillIds.size === 0) return resolvedMetadataList.map(() => 0.5)
	const skillLevelSet = await getSkillLevelSet([...exerciseSkillIds])

	// Walk through the exercises to calculate success rates.
	return resolvedMetadataList.map(exerciseMetadata => exerciseMetadata.skill === undefined && exerciseMetadata.setup === undefined ? 0.5 : skillLevelSet.getCombinedSetupExpectedSuccessRate([exerciseMetadata.skill, exerciseMetadata.setup], [undefined, exerciseMetadata.setupInferenceOrder]))
}
