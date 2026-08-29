import { isPlainObject } from '@step-wise/js-utils'

import { isCoordinateList } from '../Vector/index.ts'

import { type RectangleStorageValue } from './types.ts'
import { Rectangle } from './Rectangle.ts'

export type SerializedRectangle = {
	type: typeof Rectangle.type
	value: RectangleStorageValue
}

export function isSerializedRectangle(value: unknown): value is SerializedRectangle {
	return isPlainObject(value) && Object.keys(value).length === 2 && value.type === Rectangle.type && isPlainObject(value.value) && Object.keys(value.value).length === 2 && isCoordinateList(value.value.min) && isCoordinateList(value.value.max)
}

export function serializeRectangle(rectangle: Rectangle): SerializedRectangle {
	return {
		type: Rectangle.type,
		value: rectangle.toStorageValue(),
	}
}

export function deserializeRectangle(serializedRectangle: unknown): Rectangle {
	if (!isSerializedRectangle(serializedRectangle)) throw new Error(`Invalid serialized Rectangle.`)
	return Rectangle.fromStorageValue(serializedRectangle.value as RectangleStorageValue)
}
