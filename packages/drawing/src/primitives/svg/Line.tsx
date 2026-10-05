import { forwardRef } from 'react'

import { SvgPortal } from '../../Drawing/index.ts'
import { useResolvedPositions } from '../../positioning/index.ts'

import { getLinePath } from './support.ts'
import type { PointSequenceProps, SvgPathProps } from './types.ts'

export interface LineProps extends SvgPathProps, PointSequenceProps { }

export const Line = forwardRef<SVGPathElement, LineProps>(function Line(props, ref) {
	const { close = false, fill = 'none', positions, stroke = 'currentColor', strokeWidth = 1, ...pathProps } = props

	// Resolve positions and abort if they are not valid.
	const resolvedPositions = useResolvedPositions(positions)
	if (resolvedPositions === undefined) return null

	// Render the shape.
	return <SvgPortal>
		<path {...pathProps} d={getLinePath(resolvedPositions, close)} fill={fill} ref={ref} stroke={stroke} strokeWidth={strokeWidth} />
	</SvgPortal>
})
