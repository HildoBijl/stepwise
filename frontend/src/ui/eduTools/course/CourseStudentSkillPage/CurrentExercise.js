import { TranslationSection } from 'i18n'

import { ExerciseContainer } from '../../exercises'
import { ModuleTranslationScope } from '../../skills/components'

export function CurrentExercise({ skillId, exercise, submissionIndex }) {
	return <ModuleTranslationScope moduleId={skillId}>
		<TranslationSection entry="practice">
			<ExerciseContainer key={exercise.startedAt} skillId={skillId} exercise={exercise} inspection={true} historyIndex={submissionIndex} />
		</TranslationSection>
	</ModuleTranslationScope>
}
