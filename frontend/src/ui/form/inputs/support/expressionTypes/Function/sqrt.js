import * as General from '../index'

// Define various settings.
const numParameters = 1
const delimiter = ')'
const aliases = ['sqrt(', 'root(', 'wortel(']
export { numParameters, delimiter, aliases }

export function toLatex(data, options) {
	const { argument } = options
	const argumentLatex = General.toLatex(argument)
	return {
		latex: `\\sqrt{${argumentLatex.latex}}`,
		chars: [argumentLatex.chars, ')'],
	}
}