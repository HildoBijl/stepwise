export const timeUnits = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'] as const
export type TimeUnit = typeof timeUnits[number]

export const millisecondsPerTimeUnit: Record<TimeUnit, number> = {
	year: 365.25 * 24 * 60 * 60 * 1000,
	month: 365.25 / 12 * 24 * 60 * 60 * 1000,
	week: 7 * 24 * 60 * 60 * 1000,
	day: 24 * 60 * 60 * 1000,
	hour: 60 * 60 * 1000,
	minute: 60 * 1000,
	second: 1000,
}

const unitThresholds: Partial<Record<TimeUnit, number>> = {
	year: 11.5 * millisecondsPerTimeUnit.month,
	month: 30 / 7 * millisecondsPerTimeUnit.week,
	week: 6.5 * millisecondsPerTimeUnit.day,
	day: 23.5 * millisecondsPerTimeUnit.hour,
	hour: 59.5 * millisecondsPerTimeUnit.minute,
	minute: 59.5 * millisecondsPerTimeUnit.second,
}

export type TimeDisplay = {
	unit: TimeUnit
	value: number
}

// Determine which time unit to show for a given number of milliseconds, with the corresponding number.
export function getTimeDisplay(milliseconds: number, smallestUnit: TimeUnit): TimeDisplay {
	if (!Number.isFinite(milliseconds)) throw new Error('Invalid time: expected a finite number of milliseconds.')
	const absoluteMilliseconds = Math.abs(milliseconds)

	// Check if the time given passes any threshold for a unit. If so, apply that unit.
	const smallestUnitIndex = timeUnits.indexOf(smallestUnit)
	for (let index = 0; index < smallestUnitIndex; index++) {
		const unit = timeUnits[index]!
		if (absoluteMilliseconds >= unitThresholds[unit]!) return { unit, value: roundWithSign(milliseconds / millisecondsPerTimeUnit[unit]) }
	}

	// The time doesn't pass any threshold. Show the smallest unit.
	return {
		unit: smallestUnit,
		value: roundWithSign(milliseconds / millisecondsPerTimeUnit[smallestUnit]),
	}
}

function roundWithSign(value: number): number {
	return Math.sign(value) * Math.round(Math.abs(value))
}
