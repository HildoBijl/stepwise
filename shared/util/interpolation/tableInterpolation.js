const { isObject } = require('../objects')

const { ensureNumberLike, getInterpolationPart, isValidPart } = require('./support')
const { interpolate } = require('./rangeInterpolation')
const { gridInterpolate } = require('./gridInterpolation')

// tableInterpolate takes a table and interpolates in it. A table is an object of the form { grid: [ ... ], headers: [ ... ], ... }. Here, if the headers parameter has n sub-arrays (ranges), then the grid must be an n-dimensional array to match. Identically, the input must be an array with values for these n parameters. (If n = 1, a single parameter may be given instead of an array.)
function tableInterpolate(input, table) {
	return gridInterpolate(input, table.grid, ...table.headers)
}
module.exports.tableInterpolate = tableInterpolate

// inverseTableInterpolate takes a table with only one parameter (a 1D-table) and does inverse interpolation. The output is given and the input is found.
function inverseTableInterpolate(output, table) {
	if (!table || !table.headers || !Array.isArray(table.headers))
		throw new Error(`Interpolation error: invalid table received.`)
	if (table.headers.length > 1)
		throw new Error(`Interpolation error: can only apply inverse table interpolation on a table with one input parameter. However, the given table has ${table.headers.length}.`)
	return gridInterpolate(output, table.headers[0], table.grid)
}
module.exports.inverseTableInterpolate = inverseTableInterpolate

// columnTableInterpolate takes a table with various columns. Think of { pressure: [...], volume: [...], temperature: [...] }. It then takes the input value (for instance "300 K") and tries to interpolate it within the given inputLabel column (for instance "temperature"). Optionally also output labels can be provided, like "volume". If not, all values are returned.
function columnTableInterpolate(input, inputLabel, table, outputLabels) {
	// Verify the table and input label.
	if (!isObject(table))
		throw new Error(`Interpolation error: invalid table received. It was not an object.`)
	if (!inputLabel || !table[inputLabel] || !Array.isArray(table[inputLabel]))
		throw new Error(`Interpolation error: invalid input label "${inputLabel}" received. It was not a column of the given column table.`)

	// Verify the output labels.
	if (!outputLabels)
		outputLabels = Object.keys(table)
	const outputLabelsOriginal = outputLabels
	if (!Array.isArray(outputLabels))
		outputLabels = [outputLabels]
	outputLabels.forEach(outputLabel => {
		if (!outputLabel || !table[outputLabel] || !Array.isArray(table[outputLabel]))
			throw new Error(`Interpolation error: invalid output label "${outputLabel}" received. It was not a column of the given column table.`)
	})

	// For each output label, use the grid interpolate function to determine the corresponding value.
	const result = {}
	outputLabels.forEach(outputLabel => {
		if (inputLabel === outputLabel)
			result[outputLabel] = input
		else
			result[outputLabel] = gridInterpolate(input, table[outputLabel], table[inputLabel])
	})

	// Was a single output label received? If so, also return a single number.
	if (!Array.isArray(outputLabelsOriginal))
		return result[outputLabelsOriginal]
	return result
}
module.exports.columnTableInterpolate = columnTableInterpolate

// shiftingTableInterpolate takes a set of varying tables and interpolates between them. For instance, if you have a table for p = 1 bar, p = 2 bar, p = 4 bar, and so forth, then we can interpolate between them. The first parameter is the one for said table, with the second parameter indicating the corresponding label. The remaining parameters are the same as for the columnTableInterpolate function. The result is an object with the respective parameters.
function shiftingTableInterpolate(shiftingParameter, shiftingLabel, input, inputLabel, table, outputLabels) {
	// Check the outputLabels parameter.
	const originalOutputLabels = outputLabels
	if (!Array.isArray(outputLabels))
		outputLabels = [outputLabels]

	// Check the shifting parameter.
	shiftingParameter = ensureNumberLike(shiftingParameter)

	// Find the two closest tables through a binary search.
	const [min, max] = getClosestIndices(shiftingParameter, (index) => table[index][shiftingLabel], table.length)
	const closestTables = [table[min], table[max]]

	// Determine on which part we are between these two tables. If we are outside of the range, return undefined.
	const shiftingPart = getInterpolationPart(shiftingParameter, closestTables.map(closestTable => closestTable[shiftingLabel]))
	if (!isValidPart(shiftingPart))
		return Array.isArray(originalOutputLabels) ? originalOutputLabels.map(_ => undefined) : undefined

	// For the input parameter, find the two closest numbers within each table.
	const closestIndices = closestTables.map(closestTable => getClosestIndices(input, (index) => closestTable[inputLabel][index], closestTable[inputLabel].length))
	const inputRange = [0, 1].map(startEndIndex => {
		const itemIndicesPerTable = [0, 1].map(tableIndex => closestIndices[tableIndex][startEndIndex])
		const itemValues = closestTables.map((columnTable, tableIndex) => columnTable[inputLabel][itemIndicesPerTable[tableIndex]])
		return interpolate(shiftingPart, itemValues)
	})
	const inputPart = getInterpolationPart(input, inputRange)

	// For each requested output parameter, apply the proper interpolation, using the same indices as for the input.
	const result = {}
	outputLabels.forEach(outputLabel => {
		const outputRange = [0, 1].map(startEndIndex => {
			const itemIndicesPerTable = [0, 1].map(tableIndex => closestIndices[tableIndex][startEndIndex])
			const itemValues = closestTables.map((closestTable, tableIndex) => closestTable[outputLabel][itemIndicesPerTable[tableIndex]])
			return interpolate(shiftingPart, itemValues)
		})
		result[outputLabel] = interpolate(inputPart, outputRange)
	})

	// All done. Return the result.
	if (!Array.isArray(originalOutputLabels))
		return result[originalOutputLabels]
	return result
}
module.exports.shiftingTableInterpolate = shiftingTableInterpolate
