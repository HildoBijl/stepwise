// This file has all functionalities to turn Expressions, Equations and such from String format to Input Object format. (You can turn String to IO, IO to FO, and FO to String.)

const { getNextSymbol, removeWhitespace } = require('../../../util/strings')
const { processOptions } = require('../../../util/objects')

const { defaultInterpretationSettings } = require('../../options')

const { getStartCursor, getEndCursor, getSubExpression, findEndOfTerm, moveRight, addExpressionType } = require('../support')

function strToIO(str, settings = {}) {
	settings = processOptions(settings, defaultInterpretationSettings)

	// Whitespace is always ignored. Remove it directly to prevent confusion.
	str = removeWhitespace(str)

	// Start with a single expression part. Process it as we go.
	return processExpression([{
		type: 'ExpressionPart',
		value: str,
	}], settings)
}
module.exports = strToIO

function processExpression(value, settings) {
	// Check for subscripts and powers.
	value = processSubSups(value, settings)

	// Check for fractions.
	value = processFractions(value, settings)

	// ToDo: include accents and turn them into { type: 'Accent', name: 'hat', alias: 'hat-like', value: 'm' }.

	// ToDo: extend this further with other function types. Like sqrt[3](8).

	return value
}

// processSubSups takes an Expression value with possible underscores/powers "_" and "^" and processes these symbols. It creates SubSup objects of the form { sub: 'b', sup: '2' } (okay, with proper object types).
function processSubSups(value, settings) {
	return value.map(part => processExpressionPartSubSups(part, settings)).flat()
}

// processExpressionPartSubSups takes an ExpressionPart object like { type: 'ExpressionPart', value: 'aF^2_bc' } and turns this into the right input object format, having a SubSup of the form { sub: 'b', sup: '2' } (okay, with proper object types).
function processExpressionPartSubSups(part, settings) {
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
			const end = getBracketEnd(str, position + 1)
			if (end === -1)
				throw new Error(`Invalid superscript. A superscript was opened with a bracket, but no matching closing bracket was found.`)
			power = strToIO(str.substring(position + 2, end))
			position = end + 1
		} else {
			const numberRegEx = /^-?[0-9.]+/
			const powerString = str.substring(position + 1)
			const match = powerString.match(numberRegEx)
			if (match) { // Check if it is a number, like -2.5.
				power = strToIO(match[0])
				position = position + 1 + match[0].length
			} else { // There is no bracket or number. Only take one symbol.
				power = strToIO(str[position + 1])
				position = position + 2
			}
		}
		return addExpressionType(power)
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
	// Set up a handler that finds the next slash symbol.
	const getNextSymbol = () => {
		const part = value.findIndex(part => part.type === 'ExpressionPart' && part.value.indexOf('/') !== -1)
		return (part === -1 ? null : { part, cursor: value[part].value.indexOf('/') })
	}

	// While there is a next symbol, apply it.
	for (let nextSymbol = getNextSymbol(); nextSymbol; nextSymbol = getNextSymbol()) {
		value = applyFraction(value, nextSymbol)
	}
	return value
}

function applyFraction(value, cursor) {
	// Define cursors.
	const start = getStartCursor(value)
	const beforeSymbol = cursor
	const afterSymbol = moveRight(cursor)
	const leftSide = findEndOfTerm(value, beforeSymbol, false)
	const rightSide = findEndOfTerm(value, afterSymbol, true)
	const end = getEndCursor(value)

	// Set up the fraction value.
	const numerator = processExpression(getSubExpression(value, leftSide, beforeSymbol))
	const denominator = processExpression(getSubExpression(value, afterSymbol, rightSide))
	const fractionValue = [
		addExpressionType(numerator),
		addExpressionType(denominator),
	]

	// Set up the fraction element.
	const fractionElement = {
		type: 'Function',
		name: 'frac',
		value: fractionValue,
	}

	// Build the new Expression value around it.
	return [
		...getSubExpression(value, start, leftSide),
		fractionElement,
		...getSubExpression(value, rightSide, end),
	]
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