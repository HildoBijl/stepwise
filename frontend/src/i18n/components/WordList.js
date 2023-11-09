import { lastOf } from 'step-wise/util'

import { useGetTranslation } from '../sectioning'

export function WordList({ words }) {
	// Check input.
	if (!Array.isArray(words))
		throw new Error(`Invalid WordList words: expected an array of entries, but received a parameter with type "${typeof words}" and value "${words}".`)

	// Get the final separator word "and".
	const getTranslation = useGetTranslation('language')
	let and = getTranslation('and')

	// Set up the appropriate list.
	return words.slice(0, -1).join(', ') + (words.length > 1 ? ` ${and} ` : '') + lastOf(words)
}
WordList.translation = false
