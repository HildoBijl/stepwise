import { forwardRef } from 'react'

import { ensureNumber } from '@step-wise/js-utils'

import { SvgPortal } from '../../Drawing/index.ts'
import { type Distance, type Position, useResolvedDistance, useResolvedPosition } from '../../positioning/index.ts'

import type { SvgCircleProps } from './types.ts'

export interface CircleProps extends SvgCircleProps {
	center?: Position
	radius: Distance
}

export const Circle = forwardRef<SVGCircleElement, CircleProps>(function Circle(props, ref) {
	const { center = [0, 0], radius, ...circleProps } = props

	// Resolve positions/distances and abort if they are not valid.
	const resolvedCenter = useResolvedPosition(center)
	const resolvedRadius = useResolvedDistance(radius)
	if (resolvedCenter === undefined || resolvedRadius === undefined) return null

	// Validated other input.
	ensureNumber(resolvedRadius, { nonNegative: true })

	// Render the shape.
	return <SvgPortal>
		<circle {...circleProps} cx={resolvedCenter.x} cy={resolvedCenter.y} r={resolvedRadius} ref={ref} />
	</SvgPortal>
})
