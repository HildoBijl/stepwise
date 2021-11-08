// This file has all functionalities to turn Expressions, Equations and such from String format to Input Object format. (You can turn String to IO, IO to FO, and FO to String.)

const { getNextSymbol, removeWhitespace } = require('../../../util/strings')

function strToIO(str, settings) {
	// Whitespace is always ignored. Remove it directly to prevent confusion.
	str = removeWhitespace(str)

	// Start with a single expression part. We'll split it up as we go.
	let value = [{
		type: 'ExpressionPart',
		value: str,
	}]

	// Check for subscripts and powers.
	value = value.map(part => processSubSups(part)).flat()

	// Check for fractions.
	value = processFractions(value)

	// ToDo: extend this further with other function types.

	return value
}
module.exports = strToIO

// processSubSups takes an ExpressionPart object like { type: 'ExpressionPart', value: 'aF^2_bc' } and turns this into the right input object format, having a SubSup of the form { sub: 'b', sup: '2' } (okay, with proper object types).
function processSubSups(part) {
	// Only process ExpressionParts.
	if (part.type !== 'ExpressionPart')
		return part

	const str = part.value
	const result = []

	// Set up handlers. These contiuously update the position variable, which is the position of the next underscore/superscript symbol.
	let position = 0, previousPosition = 0
	const findNextSymbol = () => {
		position = getNextSymbol(str, ['_', '^'], position)
	}
	const getSubscript = () => {
		let subscriptText
		if (str[position + 1] === '(') { // There is a bracket like m_(person). Find the first closing bracket.
			const end = str.indexOf(')', position)
			if (end === -1)
				throw new Error(`Invalid subscript. A subscript was opened with a bracket, but no closing bracket was found.`)
			subscriptText = str.substring(position + 2, end)
			position = end + 1
		} else { // There is no bracket, like m_1. Only take one symbol.
			subscriptText = str[position + 1]
			position = position + 2
		}
		return { type: 'SubscriptText', value: subscriptText }
	}
	const getSuperscript = () => {
		let power
		if (str[position + 1] === '(') { // There is a bracket. Find the next closing bracket with net bracket count zero.
			const end = getBracketEnd(str, position + 1) // ToDo: figure out how to get closing bracket with supporting functions.
			if (end === -1)
				throw new Error(`Invalid superscript. A superscript was opened with a bracket, but no matching closing bracket was found.`)
			power = strToIO(str.substring(position + 2, end))
			position = end + 1
		} else { // There is no bracket. Only take one symbol.
			power = strToIO(str[position + 1])
			position = position + 2
		}
		return addType(power)
	}

	// Walk through underscores and power symbols and process them appropriately.
	findNextSymbol()
	while (position !== -1) {
		// Add the part prior to the SubSup.
		result.push({
			type: 'ExpressionPart',
			value: str.substring(previousPosition, position)
		})

		// Set up the subSup object and fill it in the right way.
		const subSup = { type: 'Function', name: 'subSup', value: [undefined, undefined] }
		if (str[position] === '_') {
			subSup.value[0] = getSubscript(subSup)
			if (str[position] === '^')
				subSup.value[1] = getSuperscript(subSup)
		} else {
			subSup.value[1] = getSuperscript(subSup)
			if (str[position] === '_')
				subSup.value[0] = getSubscript(subSup)
		}
		result.push(subSup)

		// Remember the position we're at and find the next one.
		previousPosition = position
		findNextSymbol()
	}

	// Add any remaining ExpressionPart and return the final outcome.
	result.push({
		type: 'ExpressionPart',
		value: str.substring(previousPosition),
	})
	return result
}

// processFractions takes an array of ExpressionParts with possibly other elements in there, and sets up the "frac" functions, just like in the input objects.
function processFractions(value) {
	// Walk through the parts of the expression and look for dividing symbols "/".
	const result = []
	value.forEach((part, index) => {
		// if (part.type !== 'ExpressionPart')

		// ToDo next: process functions through their aliases.
	})
	return value // TEMP
}

function addType(value) {
	return {
		type: 'Expression',
		value,
	}
}

function getBracketEnd(str, from) {
	if (str[from] !== '(')
		throw new Error(`Invalid getBracketEnd call: this function can only be called on a string where the start index points to an opening bracket. The matching closing bracket is then found. But this index did not point to an opening bracket. Values given were str="${str}" and from="${from}".`)

	// Walk through all brackets and find when the right closing bracket is found.
	let counter = 0
	let nextBracket = getNextSymbol(str, ['(', ')'], from)
	while (nextBracket !== -1) {
		// On a bracket, update the bracket counter.
		counter += (str[nextBracket] === '(' ? 1 : -1)

		// When the bracket counter hits zero, return the current position.
		if (counter === 0)
			return nextBracket

		// Move to the next bracket.
		nextBracket = getNextSymbol(str, ['(', ')'], nextBracket + 1)
	}

	throw new Error(`Invalid bracket set-up: could not find a closing bracket to match with the given opening bracket.`)
}