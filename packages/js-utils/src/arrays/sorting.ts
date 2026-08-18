export interface SortByOptions {
	order?: 'ascending' | 'descending'
}

// Sort values according to a corresponding array of numbers.
export function sortBy<T>(values: readonly T[], numbers: readonly number[], options: SortByOptions = {}): T[] {
	if (values.length !== numbers.length) throw new RangeError(`Invalid input: expected arrays of equal length, but got ${values.length} and ${numbers.length}.`)
	const { order = 'ascending' } = options
	return values
		.map((value, i) => ({ value, number: numbers[i] }))
		.sort((a, b) => order === 'ascending' ? a.number - b.number : b.number - a.number)
		.map(x => x.value)
}
