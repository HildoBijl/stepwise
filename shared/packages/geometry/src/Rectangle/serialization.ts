import { type RectangleData } from './types'
import { Rectangle } from './Rectangle'

export type SerializedRectangle = {
	type: typeof Rectangle.type
	value: RectangleData
}

export function serializeRectangle(rectangle: Rectangle): SerializedRectangle {
	return {
		type: Rectangle.type,
		value: rectangle.toStorageValue(),
	}
}

export function deserializeRectangle(serializedRectangle: SerializedRectangle): Rectangle {
	return Rectangle.fromStorageValue(serializedRectangle.value)
}
