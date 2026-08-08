import { getFIFuncs } from '..'

import { allFunctions as defaultFunctions } from './templates/with1In0After'

export const allFunctions = {
	...defaultFunctions,
	aliases: ['sqrt('],
	toLatex,
	charPartToValuePart: () => 'radicand',
	valuePartToCharPart: () => 0,
}

function toLatex(FI, options) {
	const parameter = { type: 'Expression', value: FI.radicand }
	const parameterLatex = getFIFuncs(parameter).toLatex(parameter, options)
	return {
		latex: `\\sqrt{${parameterLatex.latex}\\,}`,
		chars: [parameterLatex.chars],
	}
}
