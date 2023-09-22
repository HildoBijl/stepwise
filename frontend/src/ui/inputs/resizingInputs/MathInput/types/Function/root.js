import { getFIFuncs, isFIEmpty } from '..'

import { allFunctions as defaultFunctions } from './templates/with2In0After'

export const allFunctions = {
	...defaultFunctions,
	aliases: ['root(', 'wortel('],
	toLatex,
}

function toLatex(FI, options) {
	const { value } = FI
	const [power, parameter] = value
	const powerLatex = getFIFuncs(power).toLatex(power, options)
	const parameterLatex = getFIFuncs(parameter).toLatex(parameter, options)
	return {
		latex: `${isFIEmpty(power) ? `\\,` : ``}\\sqrt[${powerLatex.latex}]{${parameterLatex.latex}\\,}`,
		chars: [powerLatex.chars, parameterLatex.chars],
	}
}
