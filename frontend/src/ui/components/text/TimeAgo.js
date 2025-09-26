import { isNumber } from 'step-wise/util'

import { Translation, Plurals } from 'i18n'

// TimeAgo takes a time difference - a number in milliseconds - as children (often from subtracting two dates) and renders it as a message "3 minutes", "5 hours", "2 days", "1 week" or similar.
const daysPerYear = 365.25
const daysPerMonth = daysPerYear / 12
export function TimeAgo({ children: ms, displaySeconds = false }) {
	// Define translation settings.
	const translationPath = 'language'
	const translationEntry = 'timeAgo'

	// On an invalid number (undefined, NaN) assume there was never any activity.
	if (!isNumber(ms))
		return <Translation path={translationPath} entry={`${translationEntry}.never`}>Never</Translation>

	// Calculate quantities.
	const sec = ms / 1000
	const min = sec / 60
	const h = min / 60
	const d = h / 24
	const w = d / 7
	const m = d / daysPerMonth
	const y = d / daysPerYear

	// Display years?
	if (m >= 11.5) {
		const v = Math.round(y)
		return <Translation path={translationPath} entry={`${translationEntry}.years`}>
			{v} <Plurals value={v}><Plurals.One>year</Plurals.One><Plurals.NotOne>years</Plurals.NotOne></Plurals>
		</Translation>
	}

	// Display months?
	if (w >= 4.5) {
		const v = Math.round(m)
		return <Translation path={translationPath} entry={`${translationEntry}.months`}>
			{v} <Plurals value={v}><Plurals.One>month</Plurals.One><Plurals.NotOne>months</Plurals.NotOne></Plurals>
		</Translation>
	}

	// Display weeks?
	if (d >= 6.5) {
		const v = Math.round(w)
		return <Translation path={translationPath} entry={`${translationEntry}.weeks`}>
			{v} <Plurals value={v}><Plurals.One>week</Plurals.One><Plurals.NotOne>weeks</Plurals.NotOne></Plurals>
		</Translation>
	}

	// Display days?
	if (h >= 23.5) {
		const v = Math.round(d)
		return <Translation path={translationPath} entry={`${translationEntry}.days`}>
			{v} <Plurals value={v}><Plurals.One>day</Plurals.One><Plurals.NotOne>days</Plurals.NotOne></Plurals>
		</Translation>
	}

	// Display hours?
	if (min >= 59.5) {
		const v = Math.round(h)
		return <Translation path={translationPath} entry={`${translationEntry}.hours`}>
			{v} <Plurals value={v}><Plurals.One>hour</Plurals.One><Plurals.NotOne>hours</Plurals.NotOne></Plurals>
		</Translation>
	}

	// Display minutes?
	if (sec >= 59.5) {
		const v = Math.max(Math.round(min), 1)
		return <Translation path={translationPath} entry={`${translationEntry}.minutes`}>
			{v} <Plurals value={v}><Plurals.One>minute</Plurals.One><Plurals.NotOne>minutes</Plurals.NotOne></Plurals>
		</Translation>
	}

	// Display seconds?
	if (sec >= 1 && displaySeconds) {
		const v = Math.max(Math.round(sec), 1)
		return <Translation path={translationPath} entry={`${translationEntry}.seconds`}>
			{v} <Plurals value={v}><Plurals.One>second</Plurals.One><Plurals.NotOne>seconds</Plurals.NotOne></Plurals>
		</Translation>
	}

	return <Translation path={translationPath} entry={`${translationEntry}.now`}>Now</Translation>
}
