import { forwardRef } from 'react'

import { ensureNumber } from '@step-wise/js-utils'

import { SvgPortal } from '../../Drawing/index.ts'
import { type Distance, type Position, useDrawingPixelDistance } from '../../positioning/index.ts'

import { useRenderPositions } from '../resolution.ts'

import type { SvgRectangleProps } from './types.ts'

export interface RectangleProps extends SvgRectangleProps {
	corners: readonly [Position, Position]
	cornerRadius?: Distance
}

export const Rectangle = forwardRef<SVGRectElement, RectangleProps>(function Rectangle(props, ref) {
	const { cornerRadius = { pixelDistance: 0 }, corners, ...rectangleProps } = props

	// Resolve positions/distances and abort if they are not valid.
	if (!Array.isArray(corners) || corners.length !== 2) throw new Error('Invalid Rectangle corners: expected exactly two positions.')
	const resolvedCorners = useRenderPositions(corners)
	const resolvedRadius = useDrawingPixelDistance(cornerRadius)
	if (resolvedCorners === undefined || resolvedRadius === undefined) return null
	ensureNumber(resolvedRadius, { nonNegative: true })

	// Calculate the top-left corner of the rectangle and its width and height based on the resolved corners.
	const [first, second] = resolvedCorners
	const x = Math.min(first.x, second.x)
	const y = Math.min(first.y, second.y)
	const width = Math.abs(second.x - first.x)
	const height = Math.abs(second.y - first.y)

	// Render the shape.
	return <SvgPortal>
		<rect {...rectangleProps} height={height} ref={ref} rx={resolvedRadius} width={width} x={x} y={y} />
	</SvgPortal>
})
