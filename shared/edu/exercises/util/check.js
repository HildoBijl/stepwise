const { isInt } = require('../../../util/numbers')
const { areNumbersEqual } = require('../../../inputTypes/Integer')

// checkParameter is a quick and uniform way to perform an "equals" check for a parameter with the corresponding answer.
function checkParameter(parameter, correct, input, equalityOptions) {
	const parameters = Array.isArray(parameter) ? parameter : [parameter]
	return parameters.every(currParameter => {
		// Extract the correct answer.
		let currCorrect
		if (correct[currParameter] !== undefined)
			currCorrect = correct[currParameter]
		else if (!Array.isArray(parameter))
			currCorrect = correct
		if (!currCorrect)
			throw new Error(`Field check error: could not find a correct answer for field "${currParameter}". Make sure it is exported from the getCorrect function. Either the getCorrect function should export an object { param1: ..., param2: ... } or, in case the exercise has only a single answer, the getCorrect function can also export this single answer. In this case the "field" parameter may not be an array.`)

		// Extract the input.
		const currInput = input[currParameter]
		if (!currInput)
			throw new Error(`Field check error: could not find an input for field "${currParameter}". Make sure that there is an input field named "${currParameter}".`)

		// Extract equality options.
		if (equalityOptions === undefined)
			throw new Error(`Missing equality options error: expected equality options, but none were given. Note that, when using default check functions, you should provide equality options. This could be of the form { default: { ... }, input1: { ... }, input2: { ... } }, where empty objects can be used to apply default equality options.`)
		let currEqualityOptions
		if (equalityOptions[currParameter] !== undefined)
			currEqualityOptions = equalityOptions[currParameter]
		else if (equalityOptions.default !== undefined)
			currEqualityOptions = equalityOptions.default
		else if (!Array.isArray(parameter))
			currEqualityOptions = equalityOptions
		if (!currEqualityOptions)
			throw new Error(`Field check error: could not find equality options for field "${currParameter}". Make sure that the equality options object has a parameter with this name, or otherwise a parameter "default". (This could even be an empty object if default options are used.) Only when the "field" parameter is not an array do we potentially take the equalityOptions object itself as the equalityOptions parameter for this field.`)

		// What kind of parameter do we have? Is it a pure number?
		const isInputANumber = currInput.constructor === (0).constructor
		const isCorrectANumber = currCorrect.constructor === (0).constructor
		if (isInputANumber || isCorrectANumber) {
			const currInputAsNumber = (isInputANumber ? currInput : currInput.number)
			const currCorrectAsNumber = (isCorrectANumber ? currCorrect : currCorrect.number)
			return areNumbersEqual(currCorrectAsNumber, currInputAsNumber, currEqualityOptions)
		}

		// We have an object-based parameter. Use the built-in equals function.
		return currCorrect.equals(currInput, currEqualityOptions)
	})
}
module.exports.checkParameter = checkParameter