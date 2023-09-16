import { useRef } from 'react'

import { useFormData } from '../provider'

export function useCursorRef(apply = true) {
	const ref = useRef()
	const { cursorRef } = useFormData()
	return apply ? cursorRef : ref
}
