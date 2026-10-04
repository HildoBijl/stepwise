import { type CSSProperties, type HTMLAttributes, type ReactNode, forwardRef } from 'react'

import { ensureNumber } from '@step-wise/js-utils'

import { HtmlPortal, useDrawingCoordinateSystem } from '../../Drawing/index.ts'
import { anchors, type Anchor, type Position, resolveAnchor, useResolvedPosition } from '../../positioning/index.ts'

export interface HtmlElementProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	children?: ReactNode
	position: Position
	anchor?: Anchor
	rotate?: number
	scale?: number
	ignoreMouse?: boolean
}

export const HtmlElement = forwardRef<HTMLDivElement, HtmlElementProps>(function HtmlElement(props, ref) {
	const { anchor = anchors.center, children, ignoreMouse = true, position, rotate = 0, scale = 1, style, ...divProps } = props
	const coordinateSystem = useDrawingCoordinateSystem()

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
	return <HtmlPortal>
		<div {...divProps} ref={ref} style={{ ...style, ...positioningStyle }}>
			{children}
		</div>
	</HtmlPortal>
})
