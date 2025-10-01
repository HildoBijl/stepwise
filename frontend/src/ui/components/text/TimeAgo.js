import { isValidDate } from 'step-wise/util'

import { Translation, Plurals } from 'i18n'

// Define translation settings.
const translationPath = 'language'
const translationEntry = 'timeAgo'

// TimeAgo takes a time difference - a number in milliseconds - as children (often from subtracting two dates) and renders it as a message "3 minutes", "5 hours", "2 days", "1 week" or similar.
const daysPerYear = 365.25
const daysPerMonth = daysPerYear / 12
export function TimeAgo({ children: date, displaySeconds = false, addAgo = false }) {
	// On an invalid date input, assume there was never any activity.
	if (typeof date === 'string')
		date = new Date(date)
	if (!isValidDate(date))
		return <Translation path={translationPath} entry={`${translationEntry}.never`}>Never</Translation>

	// Display the text.
	const timeDisplaySettings = getTimeDisplaySettings(date, displaySeconds)
	const time = <Time displaySettings={timeDisplaySettings} />
	if (!addAgo || timeDisplaySettings.type === 'now')
		return time
	return <Ago>{time}</Ago>
}

function getTimeDisplaySettings(date, displaySeconds) {
	// Calculate quantities.
	const ms = new Date() - date
	const sec = ms / 1000
	const min = sec / 60
	const h = min / 60
	const d = h / 24
	const w = d / 7
	const m = d / daysPerMonth
	const y = d / daysPerYear

	// Display years? Months? Weeks? Days? Hours? Minutes? Seconds?
	if (m >= 11.5)
		return { type: 'year', value: Math.round(y) }
	if (w >= 4.5)
		return { type: 'month', value: Math.round(m) }
	if (d >= 6.5)
		return { type: 'week', value: Math.round(w) }
	if (h >= 23.5)
		return { type: 'day', value: Math.round(d) }
	if (min >= 59.5)
		return { type: 'hour', value: Math.round(h) }
	if (sec >= 59.5)
		return { type: 'minute', value: Math.round(min) }
	if (sec >= 1 && displaySeconds)
		return { type: 'second', value: Math.max(Math.round(sec), 1) }
	return { type: 'now' }
}

function Time({ displaySettings }) {
	const { type, value } = displaySettings
	switch (type) {
		case 'year':
			return <Translation path={translationPath} entry={`${translationEntry}.years`}>
				{value} <Plurals value={value}><Plurals.One>year</Plurals.One><Plurals.NotOne>years</Plurals.NotOne></Plurals>
			</Translation>
		case 'month':
			return <Translation path={translationPath} entry={`${translationEntry}.months`}>
				{value} <Plurals value={value}><Plurals.One>month</Plurals.One><Plurals.NotOne>months</Plurals.NotOne></Plurals>
			</Translation>
		case 'week':
			return <Translation path={translationPath} entry={`${translationEntry}.weeks`}>
				{value} <Plurals value={value}><Plurals.One>week</Plurals.One><Plurals.NotOne>weeks</Plurals.NotOne></Plurals>
			</Translation>
		case 'day':
			return <Translation path={translationPath} entry={`${translationEntry}.days`}>
				{value} <Plurals value={value}><Plurals.One>day</Plurals.One><Plurals.NotOne>days</Plurals.NotOne></Plurals>
			</Translation>
		case 'hour':
			return <Translation path={translationPath} entry={`${translationEntry}.hours`}>
				{value} <Plurals value={value}><Plurals.One>hour</Plurals.One><Plurals.NotOne>hours</Plurals.NotOne></Plurals>
			</Translation>
		case 'minute':
			return <Translation path={translationPath} entry={`${translationEntry}.minutes`}>
				{value} <Plurals value={value}><Plurals.One>minute</Plurals.One><Plurals.NotOne>minutes</Plurals.NotOne></Plurals>
			</Translation>
		case 'second':
			return <Translation path={translationPath} entry={`${translationEntry}.seconds`}>
				{value} <Plurals value={value}><Plurals.One>second</Plurals.One><Plurals.NotOne>seconds</Plurals.NotOne></Plurals>
			</Translation>
		case 'now':
			return <Translation path={translationPath} entry={`${translationEntry}.now`}>Just now</Translation>
		default:
			throw new Error(`Invalid TimeAgo case: the type was "${type}".`)
	}
}

function Ago({ children: time }) {
	return <Translation path={translationPath} entry={`${translationEntry}.ago`}>{{ time }} ago</Translation>
}
