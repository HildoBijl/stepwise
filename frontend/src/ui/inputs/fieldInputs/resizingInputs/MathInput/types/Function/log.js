import { getFIFuncs } from '..'

import { allFunctions as defaultFunctions } from './templates/with1In1After'

export const allFunctions = {
	...defaultFunctions,
	aliases: ['log('],
	toLatex,
	getInitial,
}

function toLatex(FI, options) {
	const { value } = FI
	const [parameter] = value
	const parameterLatex = getFIFuncs(parameter).toLatex(parameter, options)
	const nameCharsArray = 'log'.split('')
	nameCharsArray.include = false // Make sure that the name cannot be clicked on for cursor positioning.
	const bracketArray = '('.split('')
	bracketArray.include = false // Make sure that the bracket cannot be clicked on for cursor positioning.
	return {
		// This is the notation set-up with the number in the top left.
		// latex: `{}^{${parameterLatex.latex}}{\\rm log}(`,
		// chars: [parameterLatex.chars, nameCharsArray, bracketArray],

		// This is the notation set-up with the number in the bottom right.
		latex: `{\\rm log}_{${parameterLatex.latex}}(`,
		chars: [nameCharsArray, parameterLatex.chars, bracketArray],
	}
}

function getInitial() {
	return [{
		type: 'Expression',
		value: [
			{
				type: 'ExpressionPart',
				value: '10',
			},
		],
	}]
}
