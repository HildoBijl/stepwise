import { isCursorAtFIStart, isCursorAtFIEnd, canMoveFICursorVertically } from '..'

export function isHorizontalMovementKey(keyInfo, FI) {
	const { key } = keyInfo
	if ((key === 'ArrowLeft' || key === 'Home') && !isCursorAtFIStart(FI))
		return true
	if ((key === 'ArrowRight' || key === 'End') && !isCursorAtFIEnd(FI))
		return true
	return false
}

export function isVerticalMovementKey(keyInfo, FI) {
	const { key } = keyInfo
	if (key === 'ArrowUp' && canMoveFICursorVertically(FI, true))
		return true
	if (key === 'ArrowDown' && canMoveFICursorVertically(FI, false))
		return true
	return false
}

export function isRemovalKey(keyInfo, FI) {
	const { key } = keyInfo
	if ((key === 'Backspace') && !isCursorAtFIStart(FI))
		return true
	if ((key === 'Delete') && !isCursorAtFIEnd(FI))
		return true
	return false
}

export function isCursorKey(keyInfo, FI) {
	return (
		isHorizontalMovementKey(keyInfo, FI) ||
		isVerticalMovementKey(keyInfo, FI) ||
		isRemovalKey(keyInfo, FI)
	)
}
