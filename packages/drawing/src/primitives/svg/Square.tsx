import { forwardRef } from 'react'

import { ensureNumber } from '@step-wise/js-utils'

import { SvgPortal } from '../../Drawing/index.ts'
import { type Distance, type Position, useResolvedDistance } from '../../positioning/index.ts'

import { useRenderPosition } from '../resolution.ts'

import type { SvgRectangleProps } from './types.ts'

export interface SquareProps extends SvgRectangleProps {
	center?: Position
	side: Distance
}

export const Square = forwardRef<SVGRectElement, SquareProps>(function Square(props, ref) {
	const { center = [0, 0], side, ...rectangleProps } = props

	// Resolve positions/distances and abort if they are not valid.
	const resolvedCenter = useRenderPosition(center)
	const resolvedSide = useResolvedDistance(side)
	if (resolvedCenter === undefined || resolvedSide === undefined) return null
	ensureNumber(resolvedSide, { nonNegative: true })

	// Render the shape.
	return <SvgPortal>
		<rect {...rectangleProps} height={resolvedSide} ref={ref} width={resolvedSide} x={resolvedCenter.x - resolvedSide / 2} y={resolvedCenter.y - resolvedSide / 2} />
	</SvgPortal>
})
