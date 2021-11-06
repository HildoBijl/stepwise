const { isObject } = require('../../../util/objects')
const { firstOf, lastOf } = require('../../../util/arrays')

function getEmpty() {
	return [{ type: 'ExpressionPart', value: '' }]
}
module.exports.getEmpty = getEmpty

function isEmpty(expression) {
	const firstElement = firstOf(expression)
	return expression.length === 1 && firstElement && firstElement.value === ''
}
module.exports.isEmpty = isEmpty

function getStartCursor(value = getEmpty()) {
	return { part: 0, cursor: 0 }
}
module.exports.getStartCursor = getStartCursor

function getEndCursor(value = getEmpty()) {
	return { part: value.length - 1, cursor: lastOf(value).value.length }
}
module.exports.getEndCursor = getEndCursor

// getSubExpression gets an expression array (the IO value) and returns the expression between the left and the right cursor. The right cursor MUST be to the right (or equal to) the left cursor. Both cursors must be in an ExpressionPart (string) part of the expression array. The returned value is a value-array too.
function getSubExpression(value, left, right) {
	// Is one of the cursors missing? Use the start/end.
	if (!left)
		left = getStartCursor(value)
	if (!right)
		right = getEndCursor(value)

	// Are the cursors in the same part? If so, return an expression with just one ExpressionPart.
	if (left.part === right.part) {
		const element = value[left.part]
		return [{
			...element,
			value: element.value.substring(left.cursor, right.cursor),
		}]
	}

	// Assemble the new expression array.
	return [
		{ type: 'ExpressionPart', value: value[left.part].value.substring(left.cursor) },
		...value.slice(left.part + 1, right.part),
		{ type: 'ExpressionPart', value: value[right.part].value.substring(0, right.cursor) },
	]
}
module.exports.getSubExpression = getSubExpression

// moveRight takes a cursor position in an expression and moves it one to the right. This is useful if you want to skip over an element.
function moveRight(position) {
	return {
		...position,
		cursor: position.cursor + 1,
	}
}
module.exports.moveRight = moveRight

// findNextClosingBracket searches in the given Expression value, from the cursor position, for the next closing bracket. It counts the bracket count. So if an opening bracket is encountered, only the position of the second closing bracket is given. This is useful when having a function like "sqrt(2(x+3))". Starting after "sqrt(" the first closing bracket with zero net bracket count is the last bracket.
function findNextClosingBracket(value, cursor) {
	return findCharacterAtZeroBracketCount(value, cursor, ')')
}
module.exports.findNextClosingBracket = findNextClosingBracket

// findEndOfTerm takes an Expression value and a cursor position, and searches for the end of the term in the given direction. (Default: toRight = true.) If atLeastOneCharacter is said to "true" (default false) then the first character encountered is ignored. Basically this function searches for the first plus/minus/times/closing-bracket in the given direction when the net bracket count is zero. This is useful when for instance creating a fraction, to know what needs to be placed inside the fraction.
function findEndOfTerm(value, cursor, toRight = true, atLeastOneCharacter = false) {
	const endOfTermCharacters = ['+', '-', '*', toRight ? ')' : '(']
	return findCharacterAtZeroBracketCount(value, cursor, endOfTermCharacters, toRight, atLeastOneCharacter)
}
module.exports.findEndOfTerm = findEndOfTerm

// findCharacterAtZeroBracketCount walks through an Expression value, from the given cursor position, and looks for certain characters, stopping when one is found when the net bracket count is zero or lower. (The characters parameter may be a character like "+" or an array like ["+","-"].) This traversing is done in the given direction. (Default: toRight = true.) If skipFirst is set to true (default false) then the first character (even if it is a searched-for character) is not considered. It IS taken into account for the next bracket count though. If the net bracket count becomes negative (there is a closing bracket too many) then the traversing continues; unless of course the closing bracket is part of the characters array. If nothing is found, the start/end position (depending on direction) of the expression is given.
function findCharacterAtZeroBracketCount(value, cursor, characters, toRight = true, skipFirst = false) {
	// Process input.
	if (!Array.isArray(characters))
		characters = [characters]

	// Define iterators: parameters that will change as we go.
	let { part: partIterator, cursor: cursorIterator } = cursor
	let bracketCount = initialBracketCount

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
		if (bracketCount <= 0 && characters.includes(nextSymbol) && (!skipFirst || !first))
			return { part: partIterator, cursor: cursorIterator }

		// On a bracket, adjust the bracket count.
		if (nextSymbol === '(')
			bracketCount += toRight ? 1 : -1
		else if (nextSymbol === ')')
			bracketCount += toRight ? -1 : 1
		
		// On an encountered function (not a subSup) also adjust the bracket count.
		if (isObject(nextSymbol) && nextSymbol.type === 'Function' && nextSymbol.name !== 'subSup') {
			// ToDo: set the below lines back after moving all the expression code to shared. Also incorporate proper processing of functions like log[10](...) that need a net bracket count.
			// const countNetBrackets = getFuncs(nextSymbol).countNetBrackets
			// const netBracketCount = countNetBrackets ? countNetBrackets(nextSymbol) : 0
			// bracketCount += (toRight ? 1 : -1) * netBracketCount
		}

		// All good so far! Shift the cursor and check out the next symbol.
		shiftCursor()
		first = false
	}

	// We're at the end. Return the current cursor position.
	return { part: partIterator, cursor: cursorIterator }
}
module.exports.findCharacterAtZeroBracketCount = findCharacterAtZeroBracketCount
