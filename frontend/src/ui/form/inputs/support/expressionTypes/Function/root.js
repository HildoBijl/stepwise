import { getFuncs } from '../'

import defaultFunctions from './templates/with2In0After'
import { isDataEmpty } from '../index'

const fullExport = {
	...defaultFunctions,
	aliases: ['root(', 'wortel('],
	toLatex,
}
export default fullExport

function toLatex(data, options) {
	const { value } = data
	const [power, parameter] = value
	const powerLatex = getFuncs(power).toLatex(power, options)
	const parameterLatex = getFuncs(parameter).toLatex(parameter, options)
	return {
		latex: `${isDataEmpty(power) ? `\\,` : ``}\\sqrt[${powerLatex.latex}]{${parameterLatex.latex}\\,}`,
		chars: [powerLatex.chars, parameterLatex.chars],
	}
}