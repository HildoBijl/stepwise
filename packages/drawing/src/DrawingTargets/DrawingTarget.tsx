import { type ComponentPropsWithoutRef, type Ref, createElement, useLayoutEffect } from 'react'

import { useForwardedRef } from '@step-wise/react-utils'

import { useDrawingTarget } from './registrationHooks.ts'

export type DrawingTargetProps = Omit<ComponentPropsWithoutRef<'span'>, 'ref'> & {
	target: string
	as?: 'div' | 'span'
	ref?: Ref<HTMLElement>
}

// A component that registers a DOM element as a drawing target in the drawing target registry.
export function DrawingTarget({ target, as = 'span', ref: forwardedRef, ...props }: DrawingTargetProps) {
	const targetRef = useDrawingTarget<HTMLElement>(target)
	const ref = useForwardedRef(forwardedRef)
	useLayoutEffect(() => {
		targetRef(ref.current)
		return () => { targetRef(null) }
	}, [as, ref, targetRef])
	return createElement(as, { ...props, ref })
}
