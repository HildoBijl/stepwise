import { type RectangleLike, Rectangle } from './Rectangle.ts'
import { isRectangleInput } from './support.ts'

export function isRectangleLike(value: unknown): value is RectangleLike {
	return value instanceof Rectangle || isRectangleInput(value)
}

export function ensureRectangle(rectangle: RectangleLike, options: { dimension?: number } = {}): Rectangle {
	const ensuredRectangle = new Rectangle(rectangle)
	if (options.dimension !== undefined && ensuredRectangle.dimension !== options.dimension) throw new Error(`Invalid Rectangle dimension: expected a Rectangle of dimension ${options.dimension} but received one of dimension ${ensuredRectangle.dimension}.`)
	return ensuredRectangle
}
