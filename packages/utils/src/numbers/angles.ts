import { compareNumbers } from './comparisons'
import { mod } from './limiting'

// Convert degrees to radians.
export function deg2rad(deg: number): number {
	return deg * Math.PI / 180
}

// Convert radians to degrees.
export function rad2deg(rad: number): number {
	return rad * 180 / Math.PI
}

// Put an angle in a specific range.
export function normalizeAngle(angle: number, period = 2 * Math.PI): number {
	return mod(angle, period)
}

// Check if angles (radians) are equal.
export function equalAngles(angle1: number, angle2: number, period = 2 * Math.PI): boolean {
	const angleDifference = normalizeAngle(angle1 - angle2, period)
	return compareNumbers(angleDifference, 0) || compareNumbers(angleDifference, period)
}
