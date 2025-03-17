import { Translation } from 'i18n'
import { crossExerciseTranslationPath } from 'ui/form'

export function CrossExerciseTranslation({ children, entry }) {
	const fullEntry = `${crossExerciseTranslationPath}${entry ? `.${entry}` : ''}`
	return <Translation entry={fullEntry} extendEntry={false}>{children}</Translation>
}
