import { useCallback, useEffect, useRef } from 'react'

import { useLatest } from './refs.ts'
import { useStableCallback } from './state.ts'

type AnyFunction = (...args: any[]) => any

export function useStaggeredFunction<FunctionType extends AnyFunction>(callback: FunctionType): FunctionType {
	const callbackRef = useLatest(callback)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
	return useStableCallback(((...args: Parameters<FunctionType>) => {
		if (timeoutRef.current === undefined) {
			timeoutRef.current = setTimeout(() => {
				callback(...args)
				timeoutRef.current = undefined
			})
		}
	}) as FunctionType, [callbackRef, timeoutRef])
}

export function useThrottledFunction<FunctionType extends AnyFunction>(callback: FunctionType, time = 25, onDeny?: FunctionType): FunctionType {
	const lastTimeRef = useRef<number | undefined>(undefined)
	return useStableCallback(((...args: Parameters<FunctionType>) => {
		const lastTime = lastTimeRef.current
		const currentTime = new Date().getTime()
		if (lastTime === undefined || lastTime + time <= currentTime) {
			lastTimeRef.current = currentTime
			callback(...args)
		} else if (onDeny) {
			onDeny(...args)
		}
	}) as FunctionType)
}

export function useAnimation(animationCallback: (time: number, deltaTime: number | undefined) => void): void {
	const startTimeRef = useRef<number | undefined>(undefined)
	const previousTimeRef = useRef<number | undefined>(undefined)
	const requestRef = useRef<number | undefined>(undefined)
	const animationCallbackRef = useLatest(animationCallback)
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
