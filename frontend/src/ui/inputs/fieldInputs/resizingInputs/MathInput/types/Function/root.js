import { getFIFuncs, isFIEmpty } from '..'

import { allFunctions as defaultFunctions } from './templates/with2In0After'

export const allFunctions = {
	...defaultFunctions,
	aliases: ['root(', 'wortel('],
	toLatex,
	charPartToValuePart: part => part === 0 ? 'degree' : 'radicand',
	valuePartToCharPart: part => part === 'degree' ? 0 : 1,
}

function toLatex(FI, options) {
	const power = { type: 'Expression', value: FI.degree }
	const parameter = { type: 'Expression', value: FI.radicand }
	const powerLatex = getFIFuncs(power).toLatex(power, options)
	const parameterLatex = getFIFuncs(parameter).toLatex(parameter, options)
	return {
		latex: `${isFIEmpty(power) ? `\\,` : ``}\\sqrt[${powerLatex.latex}]{${parameterLatex.latex}\\,}`,
		chars: [powerLatex.chars, parameterLatex.chars],
	}
}
