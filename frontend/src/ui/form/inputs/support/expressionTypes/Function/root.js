import { getFuncs } from '../'

import defaultFunctions from './templates/withArgument2Parameter'

const fullExport = {
	...defaultFunctions,
	aliases: ['root(', 'wortel('],
	toLatex,
	getInitial,
}
export default fullExport

function toLatex(data, options) {
	const { value } = data
	const [power, parameter] = value
	const powerLatex = getFuncs(power).toLatex(power, options)
	const parameterLatex = getFuncs(parameter).toLatex(parameter, options)
	return {
		latex: `\\sqrt[${powerLatex.latex}]{${parameterLatex.latex}\\,}`,
		chars: [powerLatex.chars, parameterLatex.chars],
	}
}

function getInitial(parameter) {
	return [
		{
			type: 'Expression',
			value: [{
				type: 'ExpressionPart',
				value: '2',
			}],
		},
		parameter
	]
}