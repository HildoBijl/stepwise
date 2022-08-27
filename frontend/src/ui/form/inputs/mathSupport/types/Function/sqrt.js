import { getFIFuncs } from '..'

import defaultFunctions from './templates/with1In0After'

const fullExport = {
	...defaultFunctions,
	aliases: ['sqrt('],
	toLatex,
}
export default fullExport

function toLatex(FI, options) {
	const { value } = FI
	const [parameter] = value
	const parameterLatex = getFIFuncs(parameter).toLatex(parameter, options)
	return {
		latex: `\\sqrt{${parameterLatex.latex}\\,}`,
		chars: [parameterLatex.chars],
	}
}