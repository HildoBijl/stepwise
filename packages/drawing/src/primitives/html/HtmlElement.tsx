import { type CSSProperties, type HTMLAttributes, type ReactNode, forwardRef, useCallback } from 'react'

import { ensureNumber } from '@step-wise/js-utils'
import { useForwardedRef } from '@step-wise/react-utils'

import { HtmlPortal, useDrawingCoordinateSystem } from '../../Drawing/index.ts'
import { anchors, type Anchor, type Position, resolveAnchor, useDrawingTarget, useResolvedPosition } from '../../positioning/index.ts'

export interface HtmlElementProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	children?: ReactNode
	position: Position
	anchor?: Anchor
	behind?: boolean
	rotate?: number
	scale?: number
	ignoreMouse?: boolean
	target?: string
}

export const HtmlElement = forwardRef<HTMLDivElement, HtmlElementProps>(function HtmlElement(props, forwardedRef) {
	const { anchor = anchors.center, behind = false, children, ignoreMouse = true, position, rotate = 0, scale = 1, style, target, ...divProps } = props
	const coordinateSystem = useDrawingCoordinateSystem()

	// When there is a target given, attach a target ref to the element so that it's position is tracked.
	const targetRef = useDrawingTarget<HTMLDivElement>(target)
	const ref = useForwardedRef(forwardedRef)
	const setRef = useCallback((element: HTMLDivElement | null) => {
		ref.current = element
		targetRef(element)
	}, [ref, targetRef])

	// Resolve the position and abort if not known yet.
	const resolvedPosition = useResolvedPosition(position)
	if (resolvedPosition === undefined) return null

	// Resolve the anchor, rotation, and scale, then calculate the positioning style for the element.
	const resolvedAnchor = resolveAnchor(anchor, coordinateSystem)
	const rotation = ensureNumber(rotate) * (coordinateSystem.yDirection === 'up' ? -1 : 1)
	const resolvedScale = ensureNumber(scale)
	const anchorX = (resolvedAnchor.x + 1) * 50
	const anchorY = (resolvedAnchor.y + 1) * 50
	const positioningStyle: CSSProperties = {
		left: resolvedPosition.x,
		pointerEvents: ignoreMouse ? 'none' : 'auto',
		position: 'absolute',
		top: resolvedPosition.y,
		transform: `translate(${-anchorX}%, ${-anchorY}%) rotate(${rotation}rad) scale(${resolvedScale})`,
		transformOrigin: `${anchorX}% ${anchorY}%`,
	}

	// Render the element inside a portal, applying the calculated positioning style and any additional styles or props.
	return <HtmlPortal behind={behind}>
		<div {...divProps} ref={setRef} style={{ whiteSpace: 'nowrap', ...style, ...positioningStyle }}>
			{children}
		</div>
	</HtmlPortal>
})
