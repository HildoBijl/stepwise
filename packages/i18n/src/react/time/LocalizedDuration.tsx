import { useMemo } from 'react'

import { withTranslation } from '../authoring/withTranslation.tsx'
import { useI18n } from '../context/hooks.ts'
import { getTimeDisplay, type TimeUnit } from './time.ts'

export type LocalizedDurationProps = {
	milliseconds: number
	smallestUnit?: TimeUnit
	unitDisplay?: Intl.NumberFormatOptions['unitDisplay']
}

// Set up a duration string based on the international formatting rules.
function LocalizedDurationBase({ milliseconds, smallestUnit = 'minute', unitDisplay = 'long' }: LocalizedDurationProps) {
	if (milliseconds < 0) throw new Error('Invalid LocalizedDuration: milliseconds cannot be negative.')
	const { locale } = useI18n()
	const { unit, value } = getTimeDisplay(milliseconds, smallestUnit)
	const formatter = useMemo(
		() => new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay }),
		[locale, unit, unitDisplay],
	)
	return formatter.format(value)
}

// Durations perform their own locale-sensitive formatting and are therefore opaque to an outer Translation.
export const LocalizedDuration = withTranslation(LocalizedDurationBase, {
	tag: 'duration',
	translatedProps: [],
	canCopy: false,
	canDelete: false,
})
