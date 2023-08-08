const { firstOf, lastOf } = require('../../util')

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

// getSubExpression gets an expression array (the SI/FI value) and returns the expression between the left and the right cursor. The right cursor MUST be to the right (or equal to) the left cursor. Both cursors must be in an ExpressionPart (string) part of the expression array. The returned value is a value-array too.
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

// moveLeft takes a cursor position in an expression and moves it one to the left. It does this without doing any checks on the expression to see if this is possible.
function moveLeft(position, amount = 1) {
	return {
		...position,
		cursor: position.cursor - amount,
	}
}
module.exports.moveLeft = moveLeft

// moveRight takes a cursor position in an expression and moves it one to the right. It does this without doing any checks on the expression to see if this is possible.
function moveRight(position, amount = 1) {
	return {
		...position,
		cursor: position.cursor + amount,
	}
}
module.exports.moveRight = moveRight

// mergeAdjacentExpressionParts takes an Expression value array like [{ type: 'ExpressionPart', value: "..."}, {...}, {...}] and merges adjacent ExpressionPart types into a single one.
function mergeAdjacentExpressionParts(value) {
	const result = []
	value.forEach(part => {
		const lastPart = lastOf(result)
		if (part.type === 'ExpressionPart' && lastPart && lastPart.type === 'ExpressionPart')
			result[result.length - 1] = { ...lastPart, value: `${lastPart.value}${part.value}` }
		else
			result.push(part)
	})
	return result
}
module.exports.mergeAdjacentExpressionParts = mergeAdjacentExpressionParts

// addExpressionType gets an Expression value and wraps it in an object with type Expression. This is useful because inside Expressions many subexpressions have this format.
function addExpressionType(value) {
	return {
		type: 'Expression',
		value,
	}
}
module.exports.addExpressionType = addExpressionType

// getExpressionWithValue returns a SI expression with the given string value.
function getExpressionWithValue(value) {
	return addExpressionType([{ type: 'ExpressionPart', value }])
}
module.exports.getExpressionWithValue = getExpressionWithValue

// getEmptyExpression gives an empty expression including Expression type.
function getEmptyExpression() {
	return getExpressionWithValue('')
}
module.exports.getEmptyExpression = getEmptyExpression
