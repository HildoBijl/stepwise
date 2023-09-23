import { useEffect } from 'react'

import { fieldSettings } from '../../FieldInput'

// useFieldResizing adjusts the height of the input field based on the contents.
export function useFieldResizing(inputFieldRef, value, apply, heightDelta) {
	useEffect(() => {
		if (!apply)
			return
		const contentsHeight = inputFieldRef.current.contents.offsetHeight + heightDelta
		const fieldHeight = `max(${fieldSettings.height}em, ${contentsHeight}px)`
		inputFieldRef.current.field.style.height = fieldHeight
		inputFieldRef.current.prelabel.style.height = fieldHeight
	}, [inputFieldRef, value, apply, heightDelta])
}
