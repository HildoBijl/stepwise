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
	const logCharsArray = 'log('.split('')
	logCharsArray.include = false
	return {
		latex: `{}^{${parameterLatex.latex}}{\\rm log}\\!(`,
		chars: [parameterLatex.chars, logCharsArray],
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