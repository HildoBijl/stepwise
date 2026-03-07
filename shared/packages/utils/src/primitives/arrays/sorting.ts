// Sort values according to a corresponding array of numbers.
export function sortBy<T>(values: readonly T[], numbers: readonly number[], ascending: boolean = true): T[] {
	if (values.length !== numbers.length) throw new RangeError(`Invalid input: expected arrays of equal length, but got ${values.length} and ${numbers.length}.`)
	return values
		.map((value, i) => ({ value, number: numbers[i] }))
		.sort((a, b) => ascending ? a.number - b.number : b.number - a.number)
		.map(x => x.value)
}
