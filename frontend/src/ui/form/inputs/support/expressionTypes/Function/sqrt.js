import { getFuncs } from '../'

import defaultFunctions from './defaults/singleParameterAfter'

const fullExport = {
	...defaultFunctions,
	aliases: ['sqrt'],
	toLatex,
}
export default fullExport

function toLatex(data, options) {
	const { value } = data
	const [parameter] = value
	const parameterLatex = getFuncs(parameter).toLatex(parameter, options)
	return {
		latex: `\\sqrt{${parameterLatex.latex}}`,
		chars: [parameterLatex.chars, ')'],
	}
}