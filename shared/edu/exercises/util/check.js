// checkField is a quick and uniform way to perform an "equals" check for a parameter with the corresponding answer.
function checkField(field, correct, input, equalityOptions) {
	const fields = Array.isArray(field) ? field : [field]
	return fields.every(field => {
		let currCorrect
		if (correct[field] !== undefined)
			currCorrect = correct[field]
		else if (!Array.isArray(field))
			currCorrect = correct
		if (!currCorrect)
			throw new Error(`Field check error: could not find a correct answer for field "${field}". Make sure it is exported from the getCorrect function. Either the getCorrect function should export an object { param1: ..., param2: ... } or, in case the exercise has only a single answer, the getCorrect function can also export this single answer. In this case the "field" parameter may not be an array.`)

		const currInput = input[field]
		if (!currInput)
			throw new Error(`Field check error: could not find an input for field "${field}". Make sure that there is an input field named "${field}".`)

		let currEqualityOptions
		if (equalityOptions[field] !== undefined)
			currEqualityOptions = equalityOptions[field]
		else if (equalityOptions.default !== undefined)
			currEqualityOptions = equalityOptions.default
		else if (!Array.isArray(field))
			currEqualityOptions = equalityOptions
		if (!currEqualityOptions)
			throw new Error(`Field check error: could not find equality options for field "${field}". Make sure that the equality options object has a parameter with this name, or otherwise a parameter "default". (This could even be an empty object if default options are used.) Only when the "field" parameter is not an array do we potentially take the equalityOptions object itself as the equalityOptions parameter for this field.`)

		return currCorrect.equals(currInput, currEqualityOptions)
	})
}
module.exports.checkField = checkField