const { processOptions, ensureInt, numberArray, getRandomSubset, shuffle } = require('../../../util')

// getMultipleChoiceMapping takes options for a multiple choice mapping that is then passed on to the multiple choice component.
const defaultMultipleChoiceMappingOptions = {
	numChoices: undefined, // How many choices are there?
	pick: undefined, // How many should we pick?
	include: [], // Are there any particular ones (like the correct options) we always must include?
	randomOrder: false, // Should we put the options in random order?
}
function getMultipleChoiceMapping(options) {
	// Check the input.
	let { numChoices, pick, include, randomOrder } = processOptions(options, defaultMultipleChoiceMappingOptions)
	numChoices = ensureInt(numChoices, true, true)

	// Set up the right elements to pick.
	let newMapping
	if (pick === undefined) {
		newMapping = numberArray(0, numChoices - 1) // Show all choices.
	} else {
		const includeArray = (include === undefined ? [] : (Array.isArray(include) ? include : [include])) // Use [] as a default value and ensure it's an array.
		const nonIncluded = numberArray(0, numChoices - 1).filter(index => !includeArray.includes(index)) // List all elements we may still select (those that are not automatically included).
		const numExtra = Math.max(pick - includeArray.length, 0) // How many should we still pick?
		newMapping = [...includeArray, ...getRandomSubset(nonIncluded, numExtra)]
	}

	// Optionally shuffle the final order, or sort them.
	return randomOrder ? shuffle(newMapping) : newMapping.sort((a, b) => a - b)
}
module.exports.getMultipleChoiceMapping = getMultipleChoiceMapping
