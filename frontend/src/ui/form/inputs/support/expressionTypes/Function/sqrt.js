import * as General from './index'

// Define various settings.
const numParameters = 1
const delimiter = ')'
const aliases = ['sqrt', 'wortel']
export { numParameters, delimiter, aliases }

export function toLatex(data) {
	const { value } = data
	return `\\sqrt{${General.toLatex(value[0])}}`
}