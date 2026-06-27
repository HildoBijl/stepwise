import { type LineData } from './types'
import { Line } from './Line'

export type SerializedLine = {
	type: typeof Line.type
	value: LineData
}

export function serializeLine(line: Line): SerializedLine {
	return {
		type: Line.type,
		value: line.toStorageValue(),
	}
}

export function deserializeLine(serializedLine: SerializedLine): Line {
	return Line.fromStorageValue(serializedLine.value)
}
