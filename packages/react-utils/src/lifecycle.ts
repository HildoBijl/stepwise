import { type RefObject, useEffect, useRef, useState } from 'react'

export function useIsMountedRef(): RefObject<boolean> {
	const isMountedRef = useRef(false)
	useEffect(() => {
		isMountedRef.current = true
		return () => { isMountedRef.current = false }
	}, [])
	return isMountedRef
}

export function useHasMounted(): boolean {
	const [hasMounted, setHasMounted] = useState(false)
	useEffect(() => setHasMounted(true), [])
	return hasMounted
}
