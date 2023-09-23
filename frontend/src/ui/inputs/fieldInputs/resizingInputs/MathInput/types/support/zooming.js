import { addCursor } from '../../../../FieldInput'

// zoomIn takes a FI object with a cursor and goes down one layer (or multiple if a number is specified), hence going to the first element which the cursor points at. The cursor is brought along.
export function zoomIn(FI, number = 1) {
	// If the number is large than 1, call this function recursively.
	if (number > 1)
		return zoomIn(zoomIn(FI), number - 1)

	// Zoom in in the regular way.
	const { value, cursor } = FI
	return addCursor(value[cursor.part], cursor.cursor)
}

// zoomInAt takes an FI object and zooms in at a particular child of said FI element. If that element is pointed at by the cursor, the cursor is passed along. Otherwise no cursor is passed.
export function zoomInAt(FI, part) {
	const { value, cursor } = FI
	return cursor?.part === part ? zoomIn(FI) : value[part]
}
