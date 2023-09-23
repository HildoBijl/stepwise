import { useEffect } from 'react'

import { useInputData } from '../../../Input'

import { getFIFuncs } from './types'
import { MathWithoutCursor } from './MathWithoutCursor'

export function MathWithCursor({ ...FI }) {
	const { cursorRef, inputFieldRef, charElementsRef, active } = useInputData()
	const { type, value } = FI

	// When the cursor changes, or the value changes (like on a delete key), reposition the cursor.
	useEffect(() => {
		// If the field is not active, hide the cursor.
		// Gather all data. If anything is missing, no cursor is shown.
		const cursorHandle = cursorRef.current
		const charElements = charElementsRef?.current
		const contentsElement = inputFieldRef.current?.contents
		if (!FI.cursor || !charElements || !contentsElement)
			return

		// Let the expression figure out where the cursor should be and apply this.
		const cursorProperties = getFIFuncs(FI).getCursorProperties(FI, charElements, contentsElement)
		cursorHandle.show(cursorProperties)
	}, [active, inputFieldRef, charElementsRef, cursorRef, FI])

	// Render the maths without the cursor. This one should not update on a cursor change.
	return <MathWithoutCursor type={type} value={value} />
}
