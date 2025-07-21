import { Fragment } from 'react'

import { useGetTranslation } from '../sectioning'

export function WordList({ words }) {
	// Check input.
	if (!Array.isArray(words))
		throw new Error(`Invalid WordList words: expected an array of entries, but received a parameter with type "${typeof words}" and value "${words}".`)

	// Get the final separator word "and".
	const getTranslation = useGetTranslation('language')
	let and = getTranslation('and')

	// Set up the appropriate list.
	return words.map((word, index) => <Fragment key={index}>
		{word}
		{index < words.length - 2 && `, `}
		{index === words.length - 2 && ` ${and} `}
	</Fragment>)
}
WordList.translation = false
