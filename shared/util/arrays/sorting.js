// shuffle will shuffle the elements in an array. It returns a shallow copy, not affecting the original array. It uses the Fisher-Yates shuffle algorithm.
function shuffle(array) {
	array = [...array] // Clone array.
	for (let currIndex = array.length - 1; currIndex > 0; currIndex--) {
		const newPlace = Math.floor(Math.random() * (currIndex + 1))
		const temp = array[newPlace]
		array[newPlace] = array[currIndex]
		array[currIndex] = temp
	}
	return array
}
module.exports.shuffle = shuffle

// sortByIndices takes two arrays, one with values ['a', 'b', 'c'] and one with numbers like [8, 2, 4]. It sorts the number array like [2, 4, 8] but returns the array with corresponding values ['b', 'c', 'a'].
function sortByIndices(values, numbers, ascending = true) {
	// Check the input.
	if (!Array.isArray(values) || !Array.isArray(numbers))
		throw new Error(`Invalid parameter: expected arrays but received parameters of type "${typeof values}" and "${typeof numbers}".`)
	if (values.length !== numbers.length)
		throw new Error(`Invalid input: expected two arrays of equal length, but the values array was of length ${values.length} while the indices array was of length ${numbers.length}.`)
	numbers = numbers.map(number => ensureNumber(number))

	// Create an array with merged objects and sort it. Then extract the values from it.
	return values
		.map((value, index) => ({ value, number: numbers[index] }))
		.sort((a, b) => ascending ? a.number - b.number : b.number - a.number)
		.map(obj => obj.value)
}
module.exports.sortByIndices = sortByIndices
