// checkField is a quick and uniform way to perform an "equals" check for a parameter with the corresponding answer.
function checkField(field, correct, input, equalityOptions) {
	const fields = Array.isArray(field) ? field : [field]
	return fields.every(field => {
		const currCorrect = correct[field]
		if (!currCorrect)
			throw new Error(`Field check error: could not find a correct answer for field "${field}". Make sure it is exported from the getCorrect function.`)

		const currInput = input[field] || input[`ans${field}`]
		if (!currInput)
			throw new Error(`Field check error: could not find an input for field "${field}". Make sure that there is an input field named either "${field}" or "ans${field}".`)

		const currEqualityOptions = equalityOptions[field]
		if (!currEqualityOptions)
		throw new Error(`Field check error: could not find equality options for field "${field}". Make sure that the equality options object has a parameter with this name. It could be an empty object if default options are used.`)

		return currCorrect.equals(currInput, currEqualityOptions)
	})
}
module.exports.checkField = checkField