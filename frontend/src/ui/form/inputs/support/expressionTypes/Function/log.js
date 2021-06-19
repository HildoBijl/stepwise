import * as General from '../index'

// Define various settings.
const numParameters = 1
const aliases = ['log(']
export { numParameters, aliases }

// Define all non-default functions.
export function toLatex(data) {
	const { value } = data
	const argumentLatex = General.toLatex(value[0])

	return {
		latex: `{}^{${argumentLatex.latex}}{\\rm log}\\!(`,
		chars: [argumentLatex.chars, 'log('.split('')],
	}
}

export function getEmpty() {
	return [{
		type: 'Expression',
		value: [{
			type: 'ExpressionPart',
			value: '10',
		}]
	}]
}