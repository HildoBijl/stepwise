import { isPlainObject } from '@step-wise/js-utils'

import { isCoordinateList } from '../Vector'

import { type RectangleStorageValue } from './types'
import { Rectangle } from './Rectangle'

export type SerializedRectangle = {
	type: typeof Rectangle.type
	value: RectangleStorageValue
}

export function serializeRectangle(rectangle: Rectangle): SerializedRectangle {
	return {
		type: Rectangle.type,
		value: rectangle.toStorageValue(),
	}
}

export function deserializeRectangle(serializedRectangle: unknown): Rectangle {
	if (!isPlainObject(serializedRectangle) || Object.keys(serializedRectangle).length !== 2 || serializedRectangle.type !== Rectangle.type || !isPlainObject(serializedRectangle.value) || Object.keys(serializedRectangle.value).length !== 2 || !isCoordinateList(serializedRectangle.value.min) || !isCoordinateList(serializedRectangle.value.max)) throw new Error(`Invalid serialized Rectangle.`)
	return Rectangle.fromStorageValue(serializedRectangle.value as RectangleStorageValue)
}
