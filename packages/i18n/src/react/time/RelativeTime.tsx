import { useEffect, useMemo, useState } from 'react'

import { withTranslation } from '../authoring/withTranslation.tsx'
import { useI18n } from '../context/hooks.ts'

import { getTimeDisplay, type TimeDisplay, type TimeUnit } from './time.ts'

const maximumTimeout = 2 ** 31 - 1

export type RelativeTimeProps = {
	date: Date | string
	smallestUnit?: TimeUnit
	style?: Intl.RelativeTimeFormatStyle
}

// Set up a relative time according to the international formatting rules.
function RelativeTimeBase({ date, smallestUnit = 'minute', style = 'long' }: RelativeTimeProps) {
	const { locale } = useI18n()

	// Set up the string format for the time stamp.
	const timestamp = getTimestamp(date)
	const [now, setNow] = useState(Date.now)
	const display = getTimeDisplay(timestamp - now, smallestUnit)
	const formatter = useMemo(
		() => new Intl.RelativeTimeFormat(locale, { numeric: display.value === 0 ? 'auto' : 'always', style }),
		[display.value, locale, style],
	)

	// Add a timer to update the relative time when an update is needed.
	useEffect(() => {
		const delay = findNextDisplayChange(timestamp, now, smallestUnit, display)
		const timer = setTimeout(() => setNow(Date.now()), delay)
		return () => clearTimeout(timer)
	}, [display, now, smallestUnit, timestamp])

	// Return the result.
	return formatter.format(display.value, display.unit)
}

// Normalize the date input, turning either a Date object or a Date-like string into a timestamp number.
function getTimestamp(date: Date | string): number {
	const timestamp = date instanceof Date ? date.getTime() : new Date(date).getTime()
	if (!Number.isFinite(timestamp)) throw new Error('Invalid RelativeTime date.')
	return timestamp
}

// Find the first future millisecond value at which the formatted unit or value changes.
function findNextDisplayChange(timestamp: number, now: number, smallestUnit: TimeUnit, current: TimeDisplay): number {
	// Define checker to see if, in a given number of milliseconds, we still have the current time display.
	const isCurrentDisplay = (delay: number) => {
		const display = getTimeDisplay(timestamp - now - delay, smallestUnit)
		return display.unit === current.unit && display.value === current.value
	}

	// Quadratically scale upwards to find a range of [time, 2*time] which the display change falls in.
	let lowerBound = 0
	let upperBound = 1
	while (upperBound < maximumTimeout && isCurrentDisplay(upperBound)) {
		lowerBound = upperBound
		upperBound = Math.min(upperBound * 2, maximumTimeout)
	}
	if (upperBound === maximumTimeout && isCurrentDisplay(upperBound)) return maximumTimeout

	// Run a binary search within the range to find the exact millisecond value of the display change.
	while (upperBound - lowerBound > 1) {
		const middle = Math.floor((lowerBound + upperBound) / 2)
		if (isCurrentDisplay(middle)) lowerBound = middle
		else upperBound = middle
	}
	return upperBound
}

// Relative times perform their own locale-sensitive formatting and are therefore opaque to an outer Translation.
export const RelativeTime = withTranslation(RelativeTimeBase, {
	tag: 'relative-time',
	translatedProps: [],
	canCopy: false,
	canDelete: false,
})
