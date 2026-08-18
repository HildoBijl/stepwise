export interface SortByOptions {
	order?: 'ascending' | 'descending'
}

// Sort values according to a corresponding array of numbers.
export function sortBy<T>(values: readonly T[], numbers: readonly number[], options: SortByOptions = {}): T[] {
	if (values.length !== numbers.length) throw new RangeError(`Invalid input: expected arrays of equal length, but got ${values.length} and ${numbers.length}.`)
	if (!numbers.every(Number.isFinite)) throw new TypeError('Invalid input: sort numbers must all be finite numbers.')
	const { order = 'ascending' } = options
	if (order !== 'ascending' && order !== 'descending') throw new TypeError(`Invalid sort order: expected "ascending" or "descending", but received "${order}".`)
	return values
		.map((value, i) => ({ value, number: numbers[i] }))
		.sort((a, b) => order === 'ascending' ? a.number - b.number : b.number - a.number)
		.map(x => x.value)
}
