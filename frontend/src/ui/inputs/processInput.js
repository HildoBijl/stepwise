import { processInput as processIntegerInput } from './IntegerInput'

// processInput takes an input object like { name: { type: 'String', value: 'John'}, age: { type: 'Integer', value: '20' }} and turns it into a processed object { name: 'John', age: 20 }. Note that some parameters (like numbers) now get processed into objects usable by input checking functions.
export default function processInput(input) {
	const result = {}
	Object.keys(input).forEach(key => {
		result[key] = processInputParameter(input[key])
	})
	console.log('Received')
	console.log(input)
		console.log(result)
	return result
}

// processInputParameter takes an input parameter like { type: 'Integer', value: '20' } and processes it into something that can be used by a checking function, in this example a number 20.
export function processInputParameter(inputParameter) {
	// Check boundary cases.
	if (inputParameter === undefined)
		return null
	if (!inputParameter.type)
		return inputParameter
	
	// Find which preprocessor to use.
	switch (inputParameter.type) {
		case 'Integer': 
			return processIntegerInput(inputParameter.value)
		default:
			throw new Error(`Invalid input type "${inputParameter.type}" detected. No processing function is known for this type.`)
	}
}