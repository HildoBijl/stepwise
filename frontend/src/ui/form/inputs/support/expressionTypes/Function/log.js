import { getFuncs } from '../'

import defaultFunctions from './defaults/singleParameter'

const fullExport = {
	...defaultFunctions,
	aliases: ['log('],
	toLatex,
	getEmpty,
}
export default fullExport

function toLatex(data, options) {
	const { value } = data
	const [parameter] = value
	const parameterLatex = getFuncs(parameter).toLatex(parameter, options)
	return {
		latex: `{}^{${parameterLatex.latex}}{\\rm log}\\!(`,
		chars: [parameterLatex.chars, 'log('.split('')],
	}
}

function getEmpty() {
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