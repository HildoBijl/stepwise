import { type ComponentPropsWithoutRef, createElement, forwardRef, useLayoutEffect } from 'react'

import { useForwardedRef } from '@step-wise/react-utils'

import { useDrawingTarget } from './hooks.ts'

export type DrawingTargetProps = Omit<ComponentPropsWithoutRef<'span'>, 'ref'> & {
	target: string
	as?: 'div' | 'span'
}

// A component that registers a DOM element as a drawing target in the drawing target registry.
export const DrawingTarget = forwardRef<HTMLElement, DrawingTargetProps>(function DrawingTarget({ target, as = 'span', ...props }, forwardedRef) {
	const targetRef = useDrawingTarget<HTMLElement>(target)
	const ref = useForwardedRef(forwardedRef)
	useLayoutEffect(() => {
		targetRef(ref.current)
		return () => { targetRef(null) }
	}, [as, ref, targetRef])
	return createElement(as, { ...props, ref })
})
