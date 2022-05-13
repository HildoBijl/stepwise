const { getNextSymbol } = require('../../util/strings')
const { isObject } = require('../../util/objects')
const { lastOf } = require('../../util/arrays')

const { advancedFunctionComponents } = require('./functions')
const InterpretationError = require('./InterpretationError')

// Define various sets of brackets, used by functions searching for bracket starts/endings.
const roundBrackets = ['(', ')']
module.exports.roundBrackets = roundBrackets
const squareBrackets = ['[', ']']
module.exports.squareBrackets = squareBrackets

// findNextClosingBracket searches in the given Expression value, from the cursor position, for the next closing bracket. It tracks the bracket count. So if an opening bracket is encountered, only the position of the second closing bracket is given. This is useful when having a function like "sqrt(2(x+3))". Starting after "sqrt(" the first closing bracket with zero net bracket count is the last bracket.
function findNextClosingBracket(value, cursor) {
	return findCharacterAtZeroBracketCount(value, cursor, ')')
}
module.exports.findNextClosingBracket = findNextClosingBracket

// findEndOfTerm takes an Expression value and a cursor position, and searches for the end of the term in the given direction. (Default: toRight = true.) If atLeastOneCharacter is set to "true" (default false) then the first character encountered is ignored. Basically this function searches for the first plus/minus/times/closing-bracket in the given direction when the net bracket count is zero. This is useful when for instance creating a fraction, to know what needs to be placed inside the fraction.
function findEndOfTerm(value, cursor, toRight = true, atLeastOneCharacter = false) {
	const endOfTermCharacters = ['=', '+', '-', '*', '/', toRight ? ')' : '(']
	return findCharacterAtZeroBracketCount(value, cursor, endOfTermCharacters, toRight, atLeastOneCharacter)
}
module.exports.findEndOfTerm = findEndOfTerm

// findCharacterAtZeroBracketCount walks through an Expression value, from the given cursor position, and looks for certain characters, stopping when one is found when the net bracket count is zero or lower. (The characters parameter may be a character like "+" or an array like ["+","-"] or even a function that checks if it is a wanted character.) This traversing is done in the given direction. (Default: toRight = true.) If skipFirst is set to true (default false) then the first character (even if it is a searched-for character) is not considered. It IS taken into account for the next bracket count though. If the net bracket count becomes negative (there is a closing bracket too many) then the traversing continues; unless of course the closing bracket is part of the characters array. If nothing is found, the start/end position (depending on direction) of the expression is given.
function findCharacterAtZeroBracketCount(value, cursor, isWantedCharacter, toRight = true, skipFirst = false, brackets = roundBrackets) {
	// Process input. Ensure that isWantedCharacter is a function.
	if (typeof isWantedCharacter !== 'function') {
		const characters = Array.isArray(isWantedCharacter) ? isWantedCharacter : [isWantedCharacter]
		isWantedCharacter = (char) => characters.includes(char)
	}

	// Define iterators: parameters that will change as we go.
	let { part: partIterator, cursor: cursorIterator } = cursor
	let bracketCount = 0

	// Define functions that will be needed while iterating.
	const hasNextSymbol = () => {
		if (toRight)
			return partIterator < value.length - 1 || cursorIterator < value[partIterator].value.length // Before the end of the last part?
		return partIterator > 0 || cursorIterator > 0 // After the start of the first part?
	}
	const getNextSymbol = () => {
		const currentString = value[partIterator].value
		if (toRight) { // To the right?
			if (cursorIterator === currentString.length) // At the end of a string?
				return value[partIterator + 1] // Return next special element.
			return currentString[cursorIterator] // Return next character.
		} else { // To the left?
			if (cursorIterator === 0) // At the start of a string?
				return value[partIterator - 1] // Return previous special element.
			return currentString[cursorIterator - 1] // Return previous character.
		}
	}
	const shiftCursor = () => {
		if (toRight) { // To the right?
			if (cursorIterator === value[partIterator].value.length) { // At the end of a string?
				partIterator += 2 // Move to the start of the next string.
				cursorIterator = 0
			} else {
				cursorIterator++ // Just shift the cursor.
			}
		} else { // To the left?
			if (cursorIterator === 0) { // At the start of a string?
				partIterator -= 2 // Move to the end of the previous one.
				cursorIterator = value[partIterator].value.length
			} else {
				cursorIterator-- // Just shift the cursor.
			}
		}
	}

	// Iterate over the expression.
	let first = true
	while (hasNextSymbol()) {
		const nextSymbol = getNextSymbol()

		// On a breaking character, return the current cursor position. 
		if (bracketCount <= 0 && isWantedCharacter(nextSymbol) && (!skipFirst || !first))
			return { part: partIterator, cursor: cursorIterator }

		// On a bracket, adjust the bracket count.
		if (nextSymbol === brackets[0])
			bracketCount += toRight ? 1 : -1
		else if (nextSymbol === brackets[1])
			bracketCount += toRight ? -1 : 1

		// On an encountered function, if there is a parameter after the function, the function counts as a bracket too. Count this as well.
		if (isObject(nextSymbol) && nextSymbol.type === 'Function' && advancedFunctionComponents[nextSymbol.name].hasParameterAfter && brackets[0] === '(')
			bracketCount += (toRight ? 1 : -1)

		// All good so far! Shift the cursor and check out the next symbol.
		shiftCursor()
		first = false
	}

	// We're at the end. Return the current cursor position.
	return { part: partIterator, cursor: cursorIterator }
}
module.exports.findCharacterAtZeroBracketCount = findCharacterAtZeroBracketCount

// getMatchingBrackets takes an object in (partial) SI format and returns an array [{ opening: { part: 0, cursor: 4 }, closing: { part: 2, cursor: 0 } }, ... ] with matching brackets. Brackets inside these brackets are ignored (assuming they match).
function getMatchingBrackets(value) {
	// Set up a bracket list that will be filled.
	const brackets = []
	let level = 0
	const noteOpeningBracket = (position) => {
		if (level === 0)
			brackets.push({ opening: position })
		level++
	}
	const noteClosingBracket = (position) => {
		if (level === 0)
			throw new InterpretationError('UnmatchedClosingBracket', position, `Could not interpret the expression due to a missing opening bracket.`)
		if (level === 1)
			lastOf(brackets).closing = position
		level--
	}

	// Walk through the expression parts, keeping track of opening brackets.
	value.forEach((element, part) => {
		// On a function with a parameter afterwards, like log[10](, note the opening bracket.
		if (element.type === 'Function') {
			const { name } = element
			if (advancedFunctionComponents[name].hasParameterAfter)
				noteOpeningBracket({ part })
		}

		// With the above checked, only expression parts can have relevant brackets. Ignore other element types.
		if (element.type !== 'ExpressionPart')
			return

		// Walk through the brackets in this expression part.
		const str = element.value
		const getNextBracket = (fromPosition = -1) => getNextSymbol(str, ['(', ')', '[', ']'], fromPosition + 1)
		for (let nextBracket = getNextBracket(); nextBracket !== -1; nextBracket = getNextBracket(nextBracket)) {
			const bracketPosition = { part, cursor: nextBracket }
			if (str[nextBracket] === '(' || str[nextBracket] === '[')
				noteOpeningBracket(bracketPosition)
			else
				noteClosingBracket(bracketPosition)
		}
	})

	// Check that all brackets have been closed.
	if (level > 0) {
		const bracketPosition = lastOf(brackets).opening
		throw new InterpretationError('UnmatchedOpeningBracket', bracketPosition, `Could not interpret the expression part due to a missing closing bracket.`)
	}

	// All good. Return the result.
	return brackets
}
module.exports.getMatchingBrackets = getMatchingBrackets
