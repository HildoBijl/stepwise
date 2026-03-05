// Shuffle the elements in an array using the Fisher–Yates algorithm.
export function shuffle<T>(array: readonly T[]): T[] {
	const result = [...array]
	for (let currIndex = result.length - 1; currIndex > 0; currIndex--) {
		const newPlace = Math.floor(Math.random() * (currIndex + 1))
		const temp = result[newPlace]
		result[newPlace] = result[currIndex]
		result[currIndex] = temp
	}
	return result
}

// Sort values according to a corresponding array of numbers.
export function sortBy<T>(values: readonly T[], numbers: readonly number[], ascending: boolean = true): T[] {
	if (values.length !== numbers.length) throw new RangeError(`Invalid input: expected arrays of equal length, but got ${values.length} and ${numbers.length}.`)
	return values
		.map((value, i) => ({ value, number: numbers[i] }))
		.sort((a, b) => ascending ? a.number - b.number : b.number - a.number)
		.map(x => x.value)
}
