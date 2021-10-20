const { isObject } = require('../../../util/objects')
const { repeatWithIndices } = require('../../../util/functions')

const { getIOValueStart, getIOValueEnd } = require('..')

// getSubExpression gets an expression array (the IO value) and returns the expression between the left and the right cursor. The right cursor MUST be to the right (or equal to) the left cursor. Both cursors must be in an ExpressionPart (string) part of the expression array. The returned value is a value-array too.
function getSubExpression(value, left, right) {
	// Is one of the cursors missing? Use the end.
	if (!left)
		left = getIOValueStart(value)
	if (!right)
		right = getIOValueEnd(value)

	// Are the cursors in the same part? If so, return an expression with just one ExpressionPart.
	if (left.part === right.part) {
		const element = value[left.part]
		return [{
			...element,
			value: element.value.substring(left.cursor, right.cursor),
		}]
	}

	// Assemble the new expression array step by step, with the left part, the in-between parts, and the right part.
	const newValue = []
	newValue.push({ type: 'ExpressionPart', value: value[left.part].value.substring(left.cursor) })
	repeatWithIndices(left.part + 1, right.part - 1, (index) => newValue.push(value[index]))
	newValue.push({ type: 'ExpressionPart', value: value[right.part].value.substring(0, right.cursor) })

	// All done!
	return newValue
}
module.exports.getSubExpression = getSubExpression

// moveRight takes a position in an expression and moves it one to the right. This is useful if you want to skip over an element.
function moveRight(position) {
	return {
		...position,
		cursor: position.cursor + 1,
	}
}
module.exports.moveRight = moveRight

// findEndOfTerm searches for the end of a term. When you have an expression like a*cos(b+c/d+e)sin(2x)+3, and you put a "/" sign right before "sin", then we need to know which parts need to go in the fraction. We can go right (toRight = true) and left (toRight = false) and find the cursor positions of the respective endings of the terms. Basically, the term ends whenever we encounter a +, - or * and we are not still within brackets.
function findEndOfTerm(data, toRight = true, skipFirst = false, initialBracketCount = 0, returnOnZeroCount = false) {
	const { value, cursor } = data

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
		if (toRight) { // To the right.
			// At the end of a string?
			if (cursorIterator === currentString.length)
				return value[partIterator + 1] // Return next special element.
			return currentString[cursorIterator] // Return next character.
		} else { // To the left.
			// At the start of a string?
			if (cursorIterator === 0)
				return value[partIterator - 1] // Return previous special element.
			return currentString[cursorIterator - 1] // Return previous character.
		}
	}
	const shiftCursor = () => {
		if (toRight) { // To the right.
			// If we are at the end of a string, move to the start of the next string. Otherwise just shift the cursor.
			if (cursorIterator === value[partIterator].value.length) {
				partIterator += 2
				cursorIterator = 0
			} else {
				cursorIterator++
			}
		} else { // To the left.
			// If we are at the start of a string, move to the end of the previous string. Otherwise just shift the cursor.
			if (cursorIterator === 0) {
				partIterator -= 2
				cursorIterator = value[partIterator].value.length
			} else {
				cursorIterator--
			}
		}
	}

	// Iterate over the expression.
	let first = true
	while (hasNextSymbol()) {
		const nextSymbol = getNextSymbol()

		// Check if we have a zero bracket count and are ordered to return then.
		if (returnOnZeroCount && bracketCount === 0)
			return { part: partIterator, cursor: cursorIterator }

		// On an encountered function (not a subSup) return the current cursor position, unless we're inside brackets.
		if (isObject(nextSymbol) && nextSymbol.type === 'Function' && nextSymbol.name !== 'subSup') {
			if (bracketCount === 0 && (!skipFirst || !first))
				return { part: partIterator, cursor: cursorIterator }
			// ToDo: set the below lines back after moving all the expression code to shared. Also incorporate proper processing of functions like log[10](...) that need a net bracket count.
			// const countNetBrackets = getFuncs(nextSymbol).countNetBrackets
			// const netBracketCount = countNetBrackets ? countNetBrackets(nextSymbol) : 0
			// bracketCount += (toRight ? 1 : -1) * netBracketCount
		}

		// On a breaking character, return the current cursor position. 
		if (bracketCount === 0 && ['+', '-', '*'].includes(nextSymbol) && (!skipFirst || !first))
			return { part: partIterator, cursor: cursorIterator }

		// On a bracket, adjust the bracket count. If it drops below zero, return the current cursor position too.
		if (nextSymbol === '(') {
			bracketCount += toRight ? 1 : -1
			if (!toRight && bracketCount < 0)
				return { part: partIterator, cursor: cursorIterator }
		} else if (nextSymbol === ')') {
			bracketCount += toRight ? -1 : 1
			if (toRight && bracketCount < 0)
				return { part: partIterator, cursor: cursorIterator }
		}
		if (bracketCount < 0 && (!skipFirst || !first))
			return { part: partIterator, cursor: cursorIterator }

		// All good so far! Shift the cursor and check out the next symbol.
		shiftCursor()
		first = false
	}

	// We're at the end. Return the current cursor position.
	return { part: partIterator, cursor: cursorIterator }
}
module.exports.findEndOfTerm = findEndOfTerm