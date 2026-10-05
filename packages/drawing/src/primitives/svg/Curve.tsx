import { forwardRef } from 'react'

import { ensureNumber, first, last, mod, repeat } from '@step-wise/js-utils'
import type { Vector } from '@step-wise/geometry'

import { SvgPortal } from '../../Drawing/index.ts'
import { type Distance, useResolvedDistance, useResolvedPositions } from '../../positioning/index.ts'

import { getPointPath } from './support.ts'
import type { PointSequenceProps, SvgPathProps } from './types.ts'

export const curveSmoothingModes = ['through', 'around'] as const
export type CurveSmoothingMode = typeof curveSmoothingModes[number]

type CurveSmoothingOptions = {
	mode?: CurveSmoothingMode
}

export type CurveSmoothing = CurveSmoothingOptions & (
	| { ratio?: number; distance?: never }
	| { ratio?: never; distance: Distance }
)

export interface CurveProps extends Omit<SvgPathProps, 'smoothing'>, PointSequenceProps {
	smoothing?: CurveSmoothing
}

export const Curve = forwardRef<SVGPathElement, CurveProps>(function Curve(props, ref) {
	const { close = false, fill = 'none', positions, smoothing, stroke = 'currentColor', strokeWidth = 1, ...pathProps } = props

	// Resolve positions/distances and abort if they are not valid.
	const resolvedPositions = useResolvedPositions(positions)
	const resolvedSmoothingDistance = useResolvedDistance(smoothing?.distance ?? { pixelDistance: 0 })
	if (resolvedPositions === undefined || resolvedSmoothingDistance === undefined) return null
	if (resolvedPositions.length < 2) throw new Error('Invalid Curve positions: expected at least two positions.')

	// Validate the smoothing options.
	const mode = ensureCurveSmoothingMode(smoothing?.mode ?? 'through')
	if (smoothing?.ratio !== undefined && smoothing.distance !== undefined) throw new Error('Invalid Curve smoothing: expected either a ratio or a distance, not both.')
	const smoothingRatio = smoothing?.distance === undefined ? ensureNumber(smoothing?.ratio ?? 1) : undefined
	const smoothingDistance = smoothing?.distance === undefined ? undefined : resolvedSmoothingDistance

	// Determine the path and use it to render the shape.
	const path = (mode === 'through' ? getCurvePathThrough : getCurvePathAround)(resolvedPositions, close, smoothingRatio, smoothingDistance)
	return <SvgPortal>
		<path {...pathProps} d={path} fill={fill} ref={ref} stroke={stroke} strokeWidth={strokeWidth} />
	</SvgPortal>
})

// Calculate a path that rounds around the given positions.
function getCurvePathAround(inputPositions: readonly Vector[], close: boolean, smoothingRatio?: number, smoothingDistance?: number): string {
	// Remove duplicate positions and optionally close the curve by adding the first position to the end.
	let positions = inputPositions.filter((position, index) => index === 0 || !position.equals(inputPositions[index - 1]))
	if (close && !first(positions).equals(last(positions))) positions = [...positions, first(positions)]

	// Calculate the lines that connect the positions, with distance-based or proportional smoothing.
	const lines = repeat(positions.length - 1, index => {
		const start = positions[index]
		const end = positions[index + 1]
		if (smoothingDistance !== undefined) {
			const factor = Math.min(smoothingDistance / start.subtract(end).magnitude, 0.5)
			return [start.interpolate(end, factor), end.interpolate(start, factor)]
		}
		if (smoothingRatio === undefined) throw new Error('Invalid Curve smoothing: expected a ratio or a distance.')
		return [start.interpolate(end, smoothingRatio / 2), end.interpolate(start, smoothingRatio / 2)]
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
function getCurvePathThrough(positions: readonly Vector[], close: boolean, smoothingRatio?: number, smoothingDistance?: number): string {
	// Calculate the control points for the cubic curves that connect the positions, with distance-based or proportional smoothing.
	const controlPoints = positions.map((position, index) => {
		if (!close && (index === 0 || index === positions.length - 1)) return [position, position]
		const previousRelative = positions[mod(index - 1, positions.length)].subtract(position)
		const nextRelative = positions[mod(index + 1, positions.length)].subtract(position)
		let direction = nextRelative.normalize().subtract(previousRelative.normalize())
		if (direction.isZero()) return [position, position]
		direction = direction.normalize()
		if (smoothingDistance !== undefined) return [position.subtract(direction.multiply(smoothingDistance)), position.add(direction.multiply(smoothingDistance))]
		if (smoothingRatio === undefined) throw new Error('Invalid Curve smoothing: expected a ratio or a distance.')
		return [position.add(previousRelative.projectOnto(direction).multiply(smoothingRatio / 2)), position.add(nextRelative.projectOnto(direction).multiply(smoothingRatio / 2))]
	})

	// Build the path string by connecting the positions with cubic curves using the calculated control points.
	let path = `M${getPointPath(first(positions))}`
	repeat(positions.length - (close ? 0 : 1), index => {
		const nextIndex = mod(index + 1, positions.length)
		path += `C${getPointPath(controlPoints[index][1])} ${getPointPath(controlPoints[nextIndex][0])} ${getPointPath(positions[nextIndex])}`
	})
	return path
}

function ensureCurveSmoothingMode(mode: unknown): CurveSmoothingMode {
	if (mode === 'through' || mode === 'around') return mode
	throw new Error(`Invalid Curve smoothing mode: expected "through" or "around" but received "${String(mode)}".`)
}
