import { useCallback, useEffect, useRef } from 'react'

import { useLatestRef, useStableCallback } from './refs.ts'

type AnyFunction = (...args: any[]) => any

export function useStaggeredFunction<FunctionType extends AnyFunction>(callback: FunctionType): FunctionType {
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
	return useStableCallback(((...args: Parameters<FunctionType>) => {
		if (timeoutRef.current === undefined) {
			timeoutRef.current = setTimeout(() => {
				callback(...args)
				timeoutRef.current = undefined
			})
		}
	}) as FunctionType)
}

export function useAnimation(animationCallback: (time: number, deltaTime: number | undefined) => void): void {
	const startTimeRef = useRef<number | undefined>(undefined)
	const previousTimeRef = useRef<number | undefined>(undefined)
	const requestRef = useRef<number | undefined>(undefined)
	const animationCallbackRef = useLatestRef(animationCallback)
	const animate = useCallback((pageTime: number) => {
		let deltaTime: number | undefined, time: number
		if (startTimeRef.current === undefined) {
			startTimeRef.current = pageTime
			time = 0
		} else {
			time = pageTime - startTimeRef.current
			deltaTime = pageTime - previousTimeRef.current!
		}
		previousTimeRef.current = pageTime
		animationCallbackRef.current(time, deltaTime)
		requestRef.current = requestAnimationFrame(animate)
	}, [startTimeRef, previousTimeRef, animationCallbackRef])
	useEffect(() => {
		requestRef.current = requestAnimationFrame(animate)
		return () => {
			if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current)
		}
	}, [requestRef, animate])
}
