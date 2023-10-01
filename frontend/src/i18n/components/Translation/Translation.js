import { getDeepParameter } from 'step-wise/util'

import { entryAsArray } from '../../util'
import { useTranslationFile } from '../../context'

export function Translation({ path, entry, children }) {
	// Get the translation file. If it doesn't exist, render default content.
	const translationFile = useTranslationFile(path)
	if (!translationFile)
		return children

	// Get the respective entry from the translation file.
	const text = getDeepParameter(translationFile, entryAsArray(entry))
	console.log(text)

	// ToDo

	return children
}
