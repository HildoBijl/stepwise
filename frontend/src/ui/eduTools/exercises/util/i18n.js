import { Translation } from '@step-wise/i18n'

import { useExerciseData } from '../containers'

export function FeedbackTranslation({ children, group = [], id, shared = false }) {
	const { exerciseId } = useExerciseData()
	group = typeof group === 'string' ? [group] : group
	if (shared)
		return <Translation group={['practice', 'crossExercise', ...group]} id={id}>{children}</Translation>
	return <Translation group={['practice', exerciseId, 'feedback', ...group]} id={id}>{children}</Translation>
}
