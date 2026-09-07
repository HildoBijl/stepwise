import { useCallback, useEffect, useRef } from 'react'

import { useLatestRef, useStableCallback } from './refs.ts'

export interface AnimationOptions {
	readonly active?: boolean
}

export function useAnimation(animationCallback: (elapsedTime: number, deltaTime: number | undefined) => void, { active = true }: AnimationOptions = {}): void {
	const elapsedTimeRef = useRef(0)
	const previousTimeRef = useRef<number | undefined>(undefined)
	const requestRef = useRef<number | undefined>(undefined)
	const animationCallbackRef = useLatestRef(animationCallback)

	const animate = useCallback((pageTime: number) => {
		let deltaTime: number | undefined
		if (previousTimeRef.current !== undefined) {
			deltaTime = pageTime - previousTimeRef.current
			elapsedTimeRef.current += deltaTime
		}
		previousTimeRef.current = pageTime
		animationCallbackRef.current(elapsedTimeRef.current, deltaTime)
		requestRef.current = requestAnimationFrame(animate)
	}, [])

	useEffect(() => {
		if (!active) return
		previousTimeRef.current = undefined
		requestRef.current = requestAnimationFrame(animate)
		return () => {
			if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current)
			requestRef.current = undefined
			previousTimeRef.current = undefined
		}
	}, [active, animate])
}

export function useCoalescedCallback<Arguments extends unknown[]>(callback: (...args: Arguments) => void): (...args: Arguments) => void {
	const callbackRef = useLatestRef(callback)
	const argumentsRef = useRef<Arguments | undefined>(undefined)
	const requestRef = useRef<number | undefined>(undefined)

	const coalescedCallback = useStableCallback((...args: Arguments) => {
		argumentsRef.current = args
		if (requestRef.current !== undefined) return
		requestRef.current = requestAnimationFrame(() => {
			requestRef.current = undefined
			const latestArguments = argumentsRef.current
			argumentsRef.current = undefined
			if (latestArguments) callbackRef.current(...latestArguments)
		})
	})

	useEffect(() => () => {
		if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current)
		requestRef.current = undefined
		argumentsRef.current = undefined
	}, [])

	return coalescedCallback
}
