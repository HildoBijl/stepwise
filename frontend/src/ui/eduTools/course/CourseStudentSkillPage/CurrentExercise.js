import { exercises } from 'step-wise/eduTools'

import { TranslationFile, TranslationSection } from 'i18n'

import { ExerciseContainer } from '../../exercises'

export function CurrentExercise({ exercise, submissionIndex }) {
	return <TranslationFile path={`eduContent/${exercises[exercise.exerciseId].path.join('/')}`} extend={false}>
		<TranslationSection entry="practice">
			<ExerciseContainer key={exercise.startedOn} exercise={exercise} inspection={true} historyIndex={submissionIndex} />
		</TranslationSection>
	</TranslationFile>
}
