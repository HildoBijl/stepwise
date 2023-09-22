import { allFunctions as defaultFunctions } from './templates/default'

import { emptyElementChar, emptyElementCharLatex } from '../../settings'

export const allFunctions = {
	...defaultFunctions,
	aliases: ['dot('],
	toLatex,
}

function toLatex(FI, options) {
	// Specify the characters that cannot be clicked on.
	const unclickableChars = ['˙']
	unclickableChars.include = false // Don't apply click events.

	// Set up the Latex.
	const { value } = FI
	return {
		latex: `\\dot{${value || `\\,${emptyElementCharLatex}\\,`}}`,
		chars: [...(value || emptyElementChar).split(''), unclickableChars],
	}
}
