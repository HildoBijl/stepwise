import type { YDirection } from '@step-wise/drawing'

export function engineeringAngleToPixel(angle: number, yDirection: YDirection): number {
	return yDirection === 'up' ? -angle : angle
}

export function engineeringDirectionToPixel(clockwise: boolean, yDirection: YDirection): 1 | -1 {
	return clockwise === (yDirection === 'down') ? 1 : -1
}
