import { getFuncs } from '../'
import { getEmpty as getEmptyExpression } from '../Expression'

import defaultFunctions from './defaults/singleParameterAfter'

const fullExport = {
	...defaultFunctions,
	aliases: ['sqrt('],
	toLatex,
	getEmpty,
}
export default fullExport

function toLatex(data, options) {
	const { value } = data
	const [parameter] = value
	const parameterLatex = getFuncs(parameter).toLatex(parameter, options)
	return {
		latex: `\\sqrt{${parameterLatex.latex}}`,
		chars: [parameterLatex.chars],
	}
}

function getEmpty() {
	return [{
		type: 'Expression',
		value: getEmptyExpression(),
	}]
}