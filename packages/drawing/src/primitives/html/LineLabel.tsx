import { type ReactNode, forwardRef } from 'react'

import type { Position } from '../../positioning/index.ts'
import { useResolvedPosition } from '../../positioning/index.ts'

import { Label, type LabelProps } from './Label.tsx'

export interface LineLabelProps extends Omit<LabelProps, 'angle' | 'position'> {
	children?: ReactNode
	positions: readonly [Position, Position]
	oppositeTo: Position
}

export const LineLabel = forwardRef<HTMLDivElement, LineLabelProps>(function LineLabel(props, ref) {
	const { oppositeTo, positions, ...labelProps } = props
	// Resolve the two positions and the opposite position, and abort if any are not known yet.
	if (!Array.isArray(positions) || positions.length !== 2) throw new Error('Invalid LineLabel positions: expected exactly two positions.')
	const first = useResolvedPosition(positions[0])
	const second = useResolvedPosition(positions[1])
	const resolvedOpposite = useResolvedPosition(oppositeTo)
	if (first === undefined || second === undefined || resolvedOpposite === undefined) return null

	// Calculate the desired position of the Label and place it accordingly.
	const delta = second.subtract(first)
	const relative = resolvedOpposite.subtract(first)
	const side = Math.sign(delta.y * relative.x - delta.x * relative.y)
	const angle = delta.angle + side * Math.PI / 2
	const midpoint = first.interpolate(second)
	return <Label {...labelProps} angle={angle} position={{ pixelPosition: midpoint }} ref={ref} />
})
