import { isPlainObject } from '@step-wise/js-utils'

import { isCoordinateList } from '../Vector/index.ts'

import { type LineStorageValue } from './types.ts'
import { Line } from './Line.ts'

export type SerializedLine = {
	type: typeof Line.type
	value: LineStorageValue
}

export function isSerializedLine(value: unknown): value is SerializedLine {
	return isPlainObject(value) && Object.keys(value).length === 2 && value.type === Line.type && isPlainObject(value.value) && Object.keys(value.value).length === 2 && isCoordinateList(value.value.start) && isCoordinateList(value.value.direction)
}

export function serializeLine(line: Line): SerializedLine {
	return {
		type: Line.type,
		value: line.toStorageValue(),
	}
}

export function deserializeLine(serializedLine: unknown): Line {
	if (!isSerializedLine(serializedLine)) throw new Error(`Invalid serialized Line.`)
	return Line.fromStorageValue(serializedLine.value as LineStorageValue)
}
