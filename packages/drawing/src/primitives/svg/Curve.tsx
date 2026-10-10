import { forwardRef } from 'react'

import { ensureNumber, first, last, mod, repeat } from '@step-wise/js-utils'
import type { Vector } from '@step-wise/geometry'

import { SvgPortal } from '../../Drawing/index.ts'
import { type Distance, useDrawingPixelDistance } from '../../positioning/index.ts'

import { useRenderPositions } from '../resolution.ts'

import { type ArrowedPathProps, getDefaultPathArrowHeadSize, ResolvedArrowHead, resolveArrowHeadOptions } from './ArrowHead.tsx'
import { getPointPath, prepareArrowedPositions } from './support.ts'
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

export interface CurveProps extends Omit<SvgPathProps, 'smoothing'>, PointSequenceProps, ArrowedPathProps {
	smoothing?: CurveSmoothing
}

export const Curve = forwardRef<SVGPathElement, CurveProps>(function Curve(props, ref) {
	const { close = false, endArrow, fill = 'none', positions, smoothing, startArrow, stroke = 'currentColor', strokeWidth = 1, ...pathProps } = props
	const startArrowOptions = resolveArrowHeadOptions(startArrow)
	const endArrowOptions = resolveArrowHeadOptions(endArrow)

	// Resolve positions/distances and abort if they are not valid.
	const resolvedPositions = useRenderPositions(positions)
	const resolvedSmoothingDistance = useDrawingPixelDistance(smoothing?.distance ?? { pixelDistance: 0 })
	const defaultArrowSize = getDefaultPathArrowHeadSize(strokeWidth)
	const startArrowSize = useDrawingPixelDistance(startArrowOptions?.size ?? defaultArrowSize)
	const endArrowSize = useDrawingPixelDistance(endArrowOptions?.size ?? defaultArrowSize)
	if (resolvedPositions === undefined || resolvedSmoothingDistance === undefined || startArrowSize === undefined || endArrowSize === undefined) return null
	if (resolvedPositions.length < 2) throw new Error('Invalid Curve positions: expected at least two positions.')
	if (close && (startArrowOptions || endArrowOptions)) throw new Error('Invalid Curve arrows: closed curves cannot have start or end arrows.')

	// Validate the smoothing options.
	const mode = ensureCurveSmoothingMode(smoothing?.mode ?? 'around')
	if (smoothing?.ratio !== undefined && smoothing.distance !== undefined) throw new Error('Invalid Curve smoothing: expected either a ratio or a distance, not both.')
	const smoothingRatio = smoothing?.distance === undefined ? ensureNumber(smoothing?.ratio ?? 0.8) : undefined
	const smoothingDistance = smoothing?.distance === undefined ? undefined : resolvedSmoothingDistance

	// Calculate arrow directions and pull the curve endpoints underneath any arrowheads.
	const curveDirections = (startArrowOptions || endArrowOptions) && mode === 'through' ? getThroughCurveDirections(resolvedPositions, close, smoothingRatio, smoothingDistance) : undefined
	const arrowedPositions = startArrowOptions || endArrowOptions ? prepareArrowedPositions(resolvedPositions, startArrowOptions ? startArrowSize : undefined, endArrowOptions ? endArrowSize : undefined, curveDirections) : undefined
	const shaftPositions = arrowedPositions?.shaftPositions ?? resolvedPositions
	const { size: _startSize, fill: startFill = stroke, ...startPolygonProps } = startArrowOptions ?? {}
	const { size: _endSize, fill: endFill = stroke, ...endPolygonProps } = endArrowOptions ?? {}

	// Determine the path and render it with any arrowheads.
	const path = (mode === 'through' ? getCurvePathThrough : getCurvePathAround)(shaftPositions, close, smoothingRatio, smoothingDistance)
	return <SvgPortal>
		<path {...pathProps} d={path} fill={fill} ref={ref} stroke={stroke} strokeWidth={strokeWidth} />
		{startArrowOptions && <ResolvedArrowHead {...startPolygonProps} direction={arrowedPositions!.directions.startDirection} fill={startFill} position={first(resolvedPositions)} size={startArrowSize} />}
		{endArrowOptions && <ResolvedArrowHead {...endPolygonProps} direction={arrowedPositions!.directions.endDirection} fill={endFill} position={last(resolvedPositions)} size={endArrowSize} />}
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
		const startRatio = smoothingRatio * (!close && index === positions.length - 2 ? 1 : 0.5)
		const endRatio = smoothingRatio * (!close && index === 0 ? 1 : 0.5)
		return [start.interpolate(end, startRatio), end.interpolate(start, endRatio)]
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
	const controlPoints = getThroughCurveControlPoints(positions, close, smoothingRatio, smoothingDistance)

	// Build the path string by connecting the positions with cubic curves using the calculated control points.
	let path = `M${getPointPath(first(positions))}`
	repeat(positions.length - (close ? 0 : 1), index => {
		const nextIndex = mod(index + 1, positions.length)
		path += `C${getPointPath(controlPoints[index][1])} ${getPointPath(controlPoints[nextIndex][0])} ${getPointPath(positions[nextIndex])}`
	})
	return path
}

// Calculate the control points for a curve that passes through the given positions.
function getThroughCurveControlPoints(positions: readonly Vector[], close: boolean, smoothingRatio?: number, smoothingDistance?: number): [Vector, Vector][] {
	return positions.map((position, index) => {
		// For open-curve endpoints, put both control points at the endpoint itself.
		if (!close && (index === 0 || index === positions.length - 1)) return [position, position]

		// Find the direction the curve should be going in at the control point. For a 180 degree turn, put the control points at the point itself.
		const previousRelative = positions[mod(index - 1, positions.length)].subtract(position)
		const nextRelative = positions[mod(index + 1, positions.length)].subtract(position)
		let direction = nextRelative.normalize().subtract(previousRelative.normalize())
		if (direction.isZero()) return [position, position]
		direction = direction.normalize()

		// For a smoothing distance, move the control points the respective distance away from the given point.
		if (smoothingDistance !== undefined) return [position.subtract(direction.multiply(smoothingDistance)), position.add(direction.multiply(smoothingDistance))]

		// For a smoothing ratio, find the section midpoint and project it onto the direction line.
		if (smoothingRatio !== undefined) return [position.add(previousRelative.projectOnto(direction).multiply(smoothingRatio / 2)), position.add(nextRelative.projectOnto(direction).multiply(smoothingRatio / 2))]
		throw new Error('Invalid Curve smoothing: expected a ratio or a distance.')
	})
}

// Determine the outward-pointing directions at both ends of a through curve.
function getThroughCurveDirections(positions: readonly Vector[], close: boolean, smoothingRatio?: number, smoothingDistance?: number): { startDirection: Vector; endDirection: Vector } {
	const controlPoints = getThroughCurveControlPoints(positions, close, smoothingRatio, smoothingDistance)
	return {
		startDirection: first(positions).subtract(controlPoints[1][0]),
		endDirection: last(positions).subtract(controlPoints[controlPoints.length - 2][1]),
	}
}

function ensureCurveSmoothingMode(mode: unknown): CurveSmoothingMode {
	if (mode === 'through' || mode === 'around') return mode
	throw new Error(`Invalid Curve smoothing mode: expected "through" or "around" but received "${String(mode)}".`)
}
