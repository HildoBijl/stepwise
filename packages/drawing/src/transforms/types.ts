import type { TransformationLike } from '@step-wise/geometry'

export const yDirections = ['up', 'down'] as const
export type YDirection = typeof yDirections[number]

export function ensureYDirection(value: unknown): YDirection {
	if (value === 'up' || value === 'down') return value
	throw new Error(`Invalid y-direction: expected "up" or "down" but received "${String(value)}".`)
}

export type DrawingCoordinateSystemOptions = {
	width: number
	height: number
	yDirection?: YDirection
	drawingToPixelTransformation?: TransformationLike
}

export type ClientRectangle = {
	left: number
	top: number
	width: number
	height: number
}
