import { getFIFuncs } from '..'

import { allFunctions as defaultFunctions } from './templates/with1In0After'

export const allFunctions = {
	...defaultFunctions,
	aliases: ['sqrt('],
	toLatex,
}

function toLatex(FI, options) {
	const { value } = FI
	const [parameter] = value
	const parameterLatex = getFIFuncs(parameter).toLatex(parameter, options)
	return {
		latex: `\\sqrt{${parameterLatex.latex}\\,}`,
		chars: [parameterLatex.chars],
	}
}
