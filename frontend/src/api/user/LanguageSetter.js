import { useLanguageSetting } from 'i18n'

import { useUser } from './hooks'

// LanguageSetter tracks the user value, and passes its language value on to the language setter of the i18n toolbox.
export function LanguageSetter() {
	const user = useUser()
	useLanguageSetting(user?.language)
}
