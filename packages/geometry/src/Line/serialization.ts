import { isPlainObject } from '@step-wise/js-utils'

import { isCoordinateList } from '../Vector'

import { type LineStorageValue } from './types'
import { Line } from './Line'

export type SerializedLine = {
	type: typeof Line.type
	value: LineStorageValue
}

export function serializeLine(line: Line): SerializedLine {
	return {
		type: Line.type,
		value: line.toStorageValue(),
	}
}

export function deserializeLine(serializedLine: unknown): Line {
	if (!isPlainObject(serializedLine) || Object.keys(serializedLine).length !== 2 || serializedLine.type !== Line.type || !isPlainObject(serializedLine.value) || Object.keys(serializedLine.value).length !== 2 || !isCoordinateList(serializedLine.value.start) || !isCoordinateList(serializedLine.value.direction)) throw new Error(`Invalid serialized Line.`)
	return Line.fromStorageValue(serializedLine.value as LineStorageValue)
}
