import { type SVGProps, forwardRef } from 'react'

import { ensureNumber } from '@step-wise/js-utils'

import { SvgPortal, useDrawingCoordinateSystem } from '../../Drawing/index.ts'
import { type Position, useResolvedPosition } from '../../positioning/index.ts'

export interface SvgGroupProps extends SVGProps<SVGGElement> {
	position?: Position
	rotate?: number
	scale?: number
}

export const SvgGroup = forwardRef<SVGGElement, SvgGroupProps>(function SvgGroup(props, ref) {
	const { position = [0, 0], rotate = 0, scale = 1, style, ...groupProps } = props
	const coordinateSystem = useDrawingCoordinateSystem()

	// Resolve the position and abort if it is not valid.
	const resolvedPosition = useResolvedPosition(position)
	if (resolvedPosition === undefined) return null

	// Calculate the transform for the group based on the resolved position, rotation, and scale.
	const rotation = ensureNumber(rotate) * (coordinateSystem.yDirection === 'up' ? -1 : 1)
	const resolvedScale = ensureNumber(scale)
	const transform = `translate(${resolvedPosition.x} ${resolvedPosition.y}) rotate(${rotation * 180 / Math.PI}) scale(${resolvedScale})`

	// Render the group.
	return <SvgPortal>
		<g {...groupProps} ref={ref} style={style} transform={transform} />
	</SvgPortal>
})
