import { type SkillId, ensureSetup } from '@step-wise/skill-setup'
import { type SkillLevelSet } from '@step-wise/skill-tracking'
import { type ExerciseMetaData } from '@step-wise/exercise-definition'

// Calculate success rates for a list of exercises.
export async function getExerciseSuccessRates(exerciseMetaDatas: ExerciseMetaData[], getSkillLevelSet: (skillIds: SkillId[]) => Promise<SkillLevelSet>): Promise<number[]> {
	// Figure out all the skills that need to be loaded and load them.
	const exerciseSkillIds = new Set<SkillId>()
	exerciseMetaDatas.forEach(exerciseMetaData => {
		; (['skill', 'setup'] as const).forEach(item => {
			if (exerciseMetaData[item]) ensureSetup(exerciseMetaData[item]).getSkillList().forEach(skillId => exerciseSkillIds.add(skillId))
		})
	})
	const skillLevelSet = await getSkillLevelSet([...exerciseSkillIds])

	// Walk through the exercises to calculate success rates.
	return exerciseMetaDatas.map(exerciseMetaData => skillLevelSet.getSetupsExpectedValues([exerciseMetaData.skill, exerciseMetaData.setup], [undefined, exerciseMetaData.setupInferenceOrder]))
}
