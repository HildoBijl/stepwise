import { parseTagTree } from 'step-wise/util'

import { isLocalhost } from 'util'

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
		return applyTranslation(children, parseTagTree(text))
	} catch (error) {
		// On a failure to implement the translation, keep the original text.
		if (isLocalhost()) {
			console.error(`Translation failure: tried to translate an element with path ${path === undefined ? '[inherited]' : `"${path}"`} and entry ${entry === undefined ? '[inherited]' : `"${entry}"`} but failed to do so. Probably the translation text does not have the right format. The texts are as follows.\nTranslation text: ${text}\nOriginal text: ${fallbackText}`)
			console.error(error)
		}
		return applyNoTranslation(children)
	}
}
Translation.translation = false // Do not nest Translation components.
Translation.tag = 'sub-translation'
