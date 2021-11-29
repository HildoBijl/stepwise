const { getPropertyOrDefault } = require('../../../util/objects')

const { areNumbersEqual } = require('../../../inputTypes/Integer')

// performComparison is a quick and uniform way to perform an "equals" comparison for a parameter or set of parameters with the corresponding answer, given certain equality options. It takes a parameter string (or array of it) like "ans", an object with input answers like { ans: [anotherObject], ... }, a solution object with correct answers like { ans: [someObject], ... } and an equalityOptions object { ans: { ... some options ... }, ... }. It runs the equals function on the correct answers, comparing them to the inputs with the given equality options, and returns true or false, indicating whether all checks for all parameters passed. If there is only a single parameter, the other parameters may also be the direct objects themselves.
function performComparison(parameters, input, solution, equalityOptions) {
	// Process input.
	let singleParameter = false
	if (!Array.isArray(parameters)) {
		singleParameter = true
		parameters = [parameters]
	}

	return parameters.every(currParameter => {
		// Extract the input, the correct answer and the check method. Throw an error if it's missing.
		const currInput = getPropertyOrDefault(input, currParameter, false, singleParameter, true, `Field check error: could not find an input for field "${currParameter}". Make sure that there is an input field named "${currParameter}".`)
		const currCorrect = getPropertyOrDefault(solution, currParameter, false, singleParameter, true, `Field check error: could not find a correct answer for field "${currParameter}". Make sure it is exported from the getSolution function. Either the getSolution function should export an object { param1: ..., param2: ... } or, in case the exercise has only a single answer, the getSolution function can also export this single answer. In this case the "parameters" argument may not be an array.`)
		if (equalityOptions === undefined)
			throw new Error(`Missing equality options error: expected equality options, but none were given. Note that, when using default performComparison functions, you should provide equality options. This could be of the form { default: { ... }, input1: { ... }, input2: { ... } }, where empty objects can be used to apply default equality options.`)
		const currEqualityOptions = getPropertyOrDefault(equalityOptions, currParameter, true, singleParameter, true, `Field comparison error: could not find equality options for field "${currParameter}". Make sure that the equality options object has a parameter with this name, or otherwise a parameter "default". (This could even be an empty object if default options are used.) Only when the "field" parameter is not an array do we potentially take the equalityOptions object itself as the equalityOptions parameter for this field.`)

		// If the parameters are pure numbers, compare them using number comparison.
		const isInputANumber = currInput.constructor === (0).constructor
		const isCorrectANumber = currCorrect.constructor === (0).constructor
		if (isInputANumber || isCorrectANumber) {
			const currInputAsNumber = (isInputANumber ? currInput : currInput.number)
			const currCorrectAsNumber = (isCorrectANumber ? currCorrect : currCorrect.number)
			return areNumbersEqual(currCorrectAsNumber, currInputAsNumber, currEqualityOptions)
		}

		// We have an object-based parameter. Use the built-in equals function of the correct answer.
		return currCorrect.equals(currInput, currEqualityOptions)
	})
}
module.exports.performComparison = performComparison

// performCheck takes a parameter string (or array of it) like "ans", an object with input answers like { ans: [anotherObject], ... }, a solution object with correct answers like { ans: [someObject], ... } and a check object { ans: someCheckFunction, ... } with check functions. It runs the corresponding check functions and return true or false, indicating whether all checks for all parameters passed. Check functions must be a function of the form (input, correct) => { ... something returning true or false ... }. The check object may also have a fall-back "default" check function. Or if there is only a single parameter, the check object may also be a check function itself.
function performCheck(parameters, input, solution, check) {
	// Process input.
	let singleParameter = false
	if (!Array.isArray(parameters)) {
		singleParameter = true
		parameters = [parameters]
	}

	// Walk through all parameters and check all of them.
	return parameters.every(currParameter => {
		// Extract the input, the correct answer and the check method. Throw an error if it's missing.
		const currInput = getPropertyOrDefault(input, currParameter, false, singleParameter, true, `Field check error: could not find an input for field "${currParameter}". Make sure that there is an input field named "${currParameter}".`)
		const currCorrect = getPropertyOrDefault(solution, currParameter, false, singleParameter, true, `Field check error: could not find a correct answer for field "${currParameter}". Make sure it is exported from the getSolution function. Either the getSolution function should export an object { param1: ..., param2: ... } or, in case the exercise has only a single answer, the getSolution function can also export this single answer. In this case the "parameters" argument may not be an array.`)
		if (check === undefined)
			throw new Error(`Missing check error: expected a check object, but none was given.`)
		const currCheck = getPropertyOrDefault(check, currParameter, true, singleParameter, true, `Field check error: could not find a checking function for field "${currParameter}". Make sure that the checks object has a parameter with this name, or otherwise a parameter "default". Only when the "field" parameter is not an array do we potentially take the checks object itself as the check parameter for this field.`)

		// Run the extracted check with the right parameters.
		return currCheck(currCorrect, currInput, solution)
	})
}
module.exports.performCheck = performCheck