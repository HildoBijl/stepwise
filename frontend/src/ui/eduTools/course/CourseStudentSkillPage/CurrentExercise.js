import { getSkill } from '@step-wise/skill-tree'

import { TranslationFile, TranslationSection } from 'i18n'

import { ExerciseContainer } from '../../exercises'

export function CurrentExercise({ skillId, exercise, submissionIndex }) {
	const skill = getSkill(skillId)
	return <TranslationFile path={`eduContent/${skill.path.join('/')}/${skillId}`} extend={false}>
		<TranslationSection entry="practice">
			<ExerciseContainer key={exercise.startedOn} skillId={skillId} exercise={exercise} inspection={true} historyIndex={submissionIndex} />
		</TranslationSection>
	</TranslationFile>
}
