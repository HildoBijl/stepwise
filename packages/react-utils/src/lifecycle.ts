import { type MutableRefObject, useEffect, useRef } from 'react'

export function useMountedRef(): MutableRefObject<boolean> {
	const mountedRef = useRef(false)
	useEffect(() => {
		mountedRef.current = true
		return () => { mountedRef.current = false }
	}, [mountedRef])
	return mountedRef
}

export function useMounted(): boolean {
	return useMountedRef().current
}
