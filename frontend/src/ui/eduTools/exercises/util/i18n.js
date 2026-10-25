import { Translation, TranslationGroup } from '@step-wise/i18n'

export function FeedbackTranslation({ children, group = [], id, shared = false }) {
	group = typeof group === 'string' ? [group] : group
	if (shared)
		return <Translation group={['practice', 'crossExercise', ...group]} id={id}>{children}</Translation>

	return <TranslationGroup path={['feedback', ...group]}>
		<Translation id={id}>{children}</Translation>
	</TranslationGroup>
}
