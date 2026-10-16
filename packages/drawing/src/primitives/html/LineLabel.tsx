import type { ReactNode } from 'react'

import { type LineSegmentLike, ensureLineSegment } from '@step-wise/geometry'

import type { Position } from '../../positioning/index.ts'
import { useDrawingPixelPosition } from '../../positioning/index.ts'

import { Label, type LabelProps } from './Label.tsx'

type LineLabelDefinitionProps =
	| { lineSegment: LineSegmentLike; positions?: never }
	| { positions: readonly [Position, Position]; lineSegment?: never }

export type LineLabelProps = Omit<LabelProps, 'angle' | 'position'> & LineLabelDefinitionProps & {
	children?: ReactNode
	oppositeTo: Position
}

export function LineLabel(props: LineLabelProps) {
	const { lineSegment, positions, oppositeTo, ...labelProps } = props

	// Resolve the two positions and the opposite position, and abort if any are not known yet.
	if (lineSegment !== undefined && positions !== undefined) throw new Error('Invalid LineLabel definition: expected "lineSegment" or "positions", but not both.')
	if (positions !== undefined && (!Array.isArray(positions) || positions.length !== 2)) throw new Error('Invalid LineLabel positions: expected exactly two positions.')
	let inputPositions: readonly [Position, Position]
	if (positions !== undefined) {
		inputPositions = positions
	} else {
		if (lineSegment === undefined) throw new Error('Invalid LineLabel definition: expected "lineSegment" or "positions".')
		const ensuredLineSegment = ensureLineSegment(lineSegment, { dimension: 2 })
		inputPositions = [ensuredLineSegment.start, ensuredLineSegment.end]
	}
	const first = useDrawingPixelPosition(inputPositions[0])
	const second = useDrawingPixelPosition(inputPositions[1])
	const resolvedOpposite = useDrawingPixelPosition(oppositeTo)
	if (first === undefined || second === undefined || resolvedOpposite === undefined) return null

	// Calculate the desired position of the Label and place it accordingly.
	const delta = second.subtract(first)
	const relative = resolvedOpposite.subtract(first)
	const side = Math.sign(delta.y * relative.x - delta.x * relative.y)
	const angle = delta.angle + side * Math.PI / 2
	const midpoint = first.interpolate(second)
	return <Label {...labelProps} angle={angle} position={{ pixelPosition: midpoint }} />
}
