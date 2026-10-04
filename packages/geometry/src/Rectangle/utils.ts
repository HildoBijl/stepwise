import { type RectangleLike, Rectangle } from './Rectangle.ts'
import { isRectangleInput } from './support.ts'

export type EnsureRectangleOptions = {
	dimension?: number
	nonZero?: boolean
}

export function isRectangleLike(value: unknown): value is RectangleLike {
	return value instanceof Rectangle || isRectangleInput(value)
}

export function ensureRectangle(rectangle: RectangleLike, options: EnsureRectangleOptions = {}): Rectangle {
	const ensuredRectangle = new Rectangle(rectangle)
	if (options.dimension !== undefined && ensuredRectangle.dimension !== options.dimension) throw new Error(`Invalid Rectangle dimension: expected a Rectangle of dimension ${options.dimension} but received one of dimension ${ensuredRectangle.dimension}.`)
	if (options.nonZero && ensuredRectangle.size.coordinates.some(size => size === 0)) throw new Error('Invalid Rectangle: expected a non-zero size along every axis, but received a degenerate rectangle.')
	return ensuredRectangle
}
