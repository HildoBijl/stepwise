import { isBasicObject, keysToObject } from 'step-wise/util'

// processParameterOptions checks all the possible simplification cases for the parameterOptions and turns it into standard form.
export function processParameterOptions(parameterOptions) {
	// In case of a single string, turn it into an array of strings.
	if (typeof parameterOptions === 'string')
		parameterOptions = [parameterOptions]

	// In case of an array of strings, turn it into object form.
	if (Array.isArray(parameterOptions))
		parameterOptions = keysToObject(parameterOptions, () => ({}))

	// We must have a basic object now.
	if (!isBasicObject(parameterOptions))
		throw new Error(`Invalid parameterOptions given: expected either a string, an array of strings or an object with options, but received something of type ${typeof parameterOptions}.`)

	// All done.
	return parameterOptions
}
