import { getFuncs } from '../'

import defaultFunctions from './templates/with1In1After'

const fullExport = {
	...defaultFunctions,
	aliases: ['log('],
	toLatex,
	getInitial,
}
export default fullExport

function toLatex(data, options) {
	const { value } = data
	const [parameter] = value
	const parameterLatex = getFuncs(parameter).toLatex(parameter, options)
	const nameCharsArray = 'log('.split('')
	nameCharsArray.include = false // Make sure that the name cannot be clicked on for cursor positioning.
	return {
		latex: `{}^{${parameterLatex.latex}}{\\rm log}\\!(`,
		chars: [parameterLatex.chars, nameCharsArray],
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