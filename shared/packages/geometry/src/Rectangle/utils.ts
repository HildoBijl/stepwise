import { type RectangleLike, Rectangle } from './Rectangle'
import { isRectangleInput } from './support'

export function isRectangleLike(value: unknown): value is RectangleLike {
	return value instanceof Rectangle || isRectangleInput(value)
}

export function ensureRectangle(rectangle: RectangleLike): Rectangle {
	return new Rectangle(rectangle)
}
