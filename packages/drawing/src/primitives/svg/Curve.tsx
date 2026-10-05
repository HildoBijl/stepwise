import { forwardRef } from 'react'

import { ensureNumber, first, last, mod, repeat } from '@step-wise/js-utils'
import type { Vector } from '@step-wise/geometry'

import { SvgPortal } from '../../Drawing/index.ts'
import { type Distance, useResolvedDistance, useResolvedPositions } from '../../positioning/index.ts'

import { getPointPath } from './support.ts'
import type { PointSequenceProps, SvgPathProps } from './types.ts'

export interface CurveProps extends Omit<SvgPathProps, 'part'>, PointSequenceProps {
	through?: boolean
	part?: number
	spread?: Distance
}

export const Curve = forwardRef<SVGPathElement, CurveProps>(function Curve(props, ref) {
	const { close = false, fill = 'none', part = 1, positions, spread, stroke = 'currentColor', strokeWidth = 1, through = true, ...pathProps } = props

	// Resolve positions/distances and abort if they are not valid.
	const resolvedPositions = useResolvedPositions(positions)
	const resolvedSpread = useResolvedDistance(spread ?? { pixelDistance: 0 })
	if (resolvedPositions === undefined || resolvedSpread === undefined) return null
	if (resolvedPositions.length < 2) throw new Error('Invalid Curve positions: expected at least two positions.')

	// Determine the path and use it to render the shape.
	const path = (through ? getCurvePathThrough : getCurvePathAlong)(resolvedPositions, close, ensureNumber(part), spread === undefined ? undefined : resolvedSpread)
	return <SvgPortal>
		<path {...pathProps} d={path} fill={fill} ref={ref} stroke={stroke} strokeWidth={strokeWidth} />
	</SvgPortal>
})

// Calculate the path for a curve that passes through the given positions.
function getCurvePathAlong(inputPositions: readonly Vector[], close: boolean, part: number, spread?: number): string {
	// Remove duplicate positions and optionally close the curve by adding the first position to the end.
	let positions = inputPositions.filter((position, index) => index === 0 || !position.equals(inputPositions[index - 1]))
	if (close && !first(positions).equals(last(positions))) positions = [...positions, first(positions)]
	
	// Calculate the lines that connect the positions, with optional spread or part adjustments.
	const lines = repeat(positions.length - 1, index => {
		const start = positions[index]
		const end = positions[index + 1]
		if (spread !== undefined) {
			const factor = Math.min(spread / start.subtract(end).magnitude, 0.5)
			return [start.interpolate(end, factor), end.interpolate(start, factor)]
		}
		return [start.interpolate(end, part / 2), end.interpolate(start, part / 2)]
	})

	// If the curve is not closed, ensure that the first and last lines start and end at the first and last positions.
	if (!close) {
		lines[0][0] = first(positions)
		lines[lines.length - 1][1] = last(positions)
	}

	// Build the path string by connecting the lines with quadratic curves.
	let path = `M${getPointPath(first(lines)[0])}`
	repeat(lines.length, index => {
		const linePath = `L${getPointPath(lines[index][1])}`
		if (index === lines.length - 1 && !close) {
			path += linePath
			return
		}
		path += `${linePath}Q${getPointPath(positions[index + 1])} ${getPointPath(lines[(index + 1) % lines.length][0])}`
	})
	return path
}

// Calculate the path for a curve that passes through the given positions.
function getCurvePathThrough(positions: readonly Vector[], close: boolean, part: number, spread?: number): string {
	// Calculate the control points for the cubic curves that connect the positions, with optional spread or part adjustments.
	const controlPoints = positions.map((position, index) => {
		if (!close && (index === 0 || index === positions.length - 1)) return [position, position]
		const previousRelative = positions[mod(index - 1, positions.length)].subtract(position)
		const nextRelative = positions[mod(index + 1, positions.length)].subtract(position)
		let direction = nextRelative.normalize().subtract(previousRelative.normalize())
		if (direction.isZero()) return [position, position]
		direction = direction.normalize()
		if (spread !== undefined) return [position.subtract(direction.multiply(spread)), position.add(direction.multiply(spread))]
		return [position.add(previousRelative.projectOnto(direction).multiply(part / 2)), position.add(nextRelative.projectOnto(direction).multiply(part / 2))]
	})

	// Build the path string by connecting the positions with cubic curves using the calculated control points.
	let path = `M${getPointPath(first(positions))}`
	repeat(positions.length - (close ? 0 : 1), index => {
		const nextIndex = mod(index + 1, positions.length)
		path += `C${getPointPath(controlPoints[index][1])} ${getPointPath(controlPoints[nextIndex][0])} ${getPointPath(positions[nextIndex])}`
	})
	return path
}
