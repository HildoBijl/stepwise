import { type RectangleLike, Rectangle } from './Rectangle'
import { isRectangleInput } from './support'

export function isRectangleLike(value: unknown): value is RectangleLike {
	return value instanceof Rectangle || isRectangleInput(value)
}

export function ensureRectangle(rectangle: RectangleLike, dimension?: number): Rectangle {
	const ensuredRectangle = new Rectangle(rectangle)
	if (dimension !== undefined && ensuredRectangle.dimension !== dimension) throw new Error(`Invalid Rectangle dimension: expected a Rectangle of dimension ${dimension} but received one of dimension ${ensuredRectangle.dimension}.`)
	return ensuredRectangle
}
