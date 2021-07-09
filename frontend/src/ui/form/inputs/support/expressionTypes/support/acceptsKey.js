import { isCursorAtDataStart, isCursorAtDataEnd, canMoveDataCursorVertically } from '../'

export function isHorizontalMovementKey(keyInfo, data) {
	const { key } = keyInfo
	if ((key === 'ArrowLeft' || key === 'Home') && !isCursorAtDataStart(data))
		return true
	if ((key === 'ArrowRight' || key === 'End') && !isCursorAtDataEnd(data))
		return true
	return false
}

export function isVerticalMovementKey(keyInfo, data) {
	const { key } = keyInfo
	if (key === 'ArrowUp' && canMoveDataCursorVertically(data, true))
		return true
	if (key === 'ArrowDown' && canMoveDataCursorVertically(data, false))
		return true
	return false
}

export function isRemovalKey(keyInfo, data) {
	const { key } = keyInfo
	if ((key === 'Backspace') && !isCursorAtDataStart(data))
		return true
	if ((key === 'Delete') && !isCursorAtDataEnd(data))
		return true
	return false
}

export function isCursorKey(keyInfo, data) {
	return (
		isHorizontalMovementKey(keyInfo, data) ||
		isVerticalMovementKey(keyInfo, data) ||
		isRemovalKey(keyInfo, data)
	)
}