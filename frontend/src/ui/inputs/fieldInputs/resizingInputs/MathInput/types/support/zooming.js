import { addCursor, removeCursor } from '../../../../FieldInput'

import { getConstructPart } from './constructs'

// Text parts are stored as strings, but the existing editing functions benefit from a temporary FI wrapper while processing them.
export function asFI(value, cursor) {
	if (typeof value === 'string') return { type: 'ExpressionPart', value, ...(cursor === undefined ? {} : { cursor }) }
	return cursor === undefined ? value : addCursor(value, cursor)
}

// Remove a cursor and, for temporary text wrappers, return the stored string representation.
export function fromFI(FI) {
	return FI.type === 'ExpressionPart' ? FI.value : removeCursor(FI)
}

// zoomIn takes a FI object with a cursor and goes down one layer (or multiple if a number is specified), hence going to the first element which the cursor points at. The cursor is brought along.
export function zoomIn(FI, number = 1) {
	// If the number is large than 1, call this function recursively.
	if (number > 1)
		return zoomIn(zoomIn(FI), number - 1)

	// Zoom in in the regular way.
	const { cursor } = FI
	if (FI.type === 'Expression' || FI.type === 'Equation') return asFI(FI.value[cursor.part], cursor.cursor)
	return asFI(getConstructPart(FI, cursor.part), cursor.cursor)
}

// zoomInAt takes an FI object and zooms in at a particular child of said FI element. If that element is pointed at by the cursor, the cursor is passed along. Otherwise no cursor is passed.
export function zoomInAt(FI, part) {
	const { value, cursor } = FI
	if (cursor?.part === part) return zoomIn(FI)
	if (FI.type === 'Expression' || FI.type === 'Equation') return asFI(value[part])
	return asFI(getConstructPart(FI, part))
}
