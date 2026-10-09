import { type ReactNode, type SVGProps, forwardRef } from 'react'

import { SvgPortal } from '../../Drawing/index.ts'
import type { Position } from '../../positioning/index.ts'

import { useRenderPosition } from '../resolution.ts'

export interface SvgTextProps extends Omit<SVGProps<SVGTextElement>, 'x' | 'y'> {
	children?: ReactNode
	position: Position
}

export const SvgText = forwardRef<SVGTextElement, SvgTextProps>(function SvgText(props, ref) {
	const { position, textAnchor = 'middle', ...textProps } = props

	// Resolve the position and abort if it is not valid.
	const resolvedPosition = useRenderPosition(position)
	if (resolvedPosition === undefined) return null

	// Render the text element at the resolved position with the specified text anchor.
	return <SvgPortal>
		<text {...textProps} ref={ref} textAnchor={textAnchor} x={resolvedPosition.x} y={resolvedPosition.y} />
	</SvgPortal>
})
