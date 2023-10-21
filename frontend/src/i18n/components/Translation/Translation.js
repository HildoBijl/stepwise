import { isLocalhost } from 'util/development'

import { applyNoTranslation, elementToString, applyTranslation } from '../../transformation'

import { useTextTranslation } from '../../sectioning'

export function Translation({ path, entry, children, extendEntry }) {
	// Extract the translation text.
	const fallbackText = elementToString(children)
	const text = useTextTranslation(fallbackText, entry, path, extendEntry)

	// If there is no translation, render the default content.
	if (!text || text === fallbackText)
		return applyNoTranslation(children)

	// Try to implement the translation.
	try {
		return applyTranslation(children, text)
	} catch (error) {
		// On a failure to implement the translation, keep the original text.
		if (isLocalhost())
			console.error(error)
		return applyNoTranslation(children)
	}
}
