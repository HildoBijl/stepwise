import { useRef } from 'react'

import { useFormData } from '../provider'

export function useCursorRef() {
	return useFormData().cursorRef
}

export function useAbsoluteCursorRef(apply = true) {
	const ref = useRef()
	const { absoluteCursorRef } = useFormData()
	return apply ? absoluteCursorRef : ref
}
