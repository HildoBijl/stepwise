import { lastOf } from '../../../util/arrays'
import { repeatWithIndices } from '../../../util/functions'

// getSubExpression gets an expression array (the IO value) and returns the expression between the left and the right cursor. The right cursor MUST be to the right (or equal to) the left cursor. Both cursors must be in an ExpressionPart (string) part of the expression array. The returned value is a value-array too.
export function getSubExpression(value, left, right) {
	// Is one of the cursors missing? Use the end.
	if (!left)
		left = { part: 0, cursor: 0 }
	if (!right)
		right = { part: value.length - 1, cursor: lastOf(value).length }

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

// moveRight takes a position in an expression and moves it one to the right. This is useful if you want to skip over an element.
export function moveRight(position) {
	return {
		...position,
		cursor: position.cursor + 1,
	}
}
