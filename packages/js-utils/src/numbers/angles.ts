import { ensureNumber } from './checks'
import { approximatelyEqual } from './comparisons'
import { mod } from './limiting'

// Convert degrees to radians.
export function degreesToRadians(deg: number): number {
	return ensureNumber(deg) * Math.PI / 180
}

// Convert radians to degrees.
export function radiansToDegrees(rad: number): number {
	return ensureNumber(rad) * 180 / Math.PI
}

// Put an angle in a specific range.
export function normalizeAngle(angle: number, period = 2 * Math.PI): number {
	return mod(angle, period)
}

// Check if angles (radians) are equal.
export function anglesEqual(angle1: number, angle2: number, period = 2 * Math.PI): boolean {
	const angleDifference = normalizeAngle(angle1 - angle2, period)
	return approximatelyEqual(angleDifference, 0) || approximatelyEqual(angleDifference, period)
}
