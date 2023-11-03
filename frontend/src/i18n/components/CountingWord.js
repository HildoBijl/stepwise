import { isNumber } from 'step-wise/util'

import { useGetTranslation } from '../sectioning'

export function CountingWord({ children, upperCase = false }) {
	// Check input.
	if (!isNumber(children))
		throw new Error(`Invalid number: tried to set up a counting word, but received a parameter with type "${typeof children}" and value "${children}".`)

	// Get the counting word.
	const getTranslation = useGetTranslation('language')
	let word = getTranslation(`countingWords.${children}`)

	// Turn to upper case when needed.
	if (upperCase)
		word = word.charAt(0).toUpperCase() + word.slice(1)

	// Return the result.
	return word
}
CountingWord.translation = false
