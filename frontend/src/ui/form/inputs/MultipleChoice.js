import React, { useRef, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Radio from '@material-ui/core/Radio'
import Checkbox from '@material-ui/core/Checkbox'
import { alpha } from '@material-ui/core/styles/colorManipulator'
import Box from '@material-ui/core/Box'
import clsx from 'clsx'

import { numberArray, shuffle, getRandomSubset } from 'step-wise/util/arrays'
import { noop } from 'step-wise/util/functions'
import { equals, isEmpty, getEmpty } from 'step-wise/inputTypes/MultipleChoice'

import { notSelectable } from 'ui/theme'
import FeedbackBlock from 'ui/components/misc/FeedbackBlock'

import { useFormParameter } from '../Form'
import { useStatus } from '../Status'
import { useFieldFeedback } from '../FeedbackProvider'

// Set up style.
const style = (theme) => ({
	listStyleType: 'none',
	margin: '2px 3px 4px 3px', // To ensure that the box shadow is visible.
	padding: 0,

	'& .option': {
		alignItems: 'center',
		borderRadius: '0.5rem',
		display: 'flex',
		flexFlow: 'row nowrap',
		justifyContent: 'flex-start',
		marginTop: '0.6rem',
		padding: '0.4rem',
		transition: `background ${theme.transitions.duration.standard}ms`,
		...notSelectable,

		'&:first-child': {
			marginTop: 0,
		},

		'& .checkbox': {
			flex: '0 0 auto',
			transition: `color ${theme.transitions.duration.standard}ms`,
		},
		'& .contents': {
			flex: '1 1 auto',
			margin: '0.5rem',
			transition: `color ${theme.transitions.duration.standard}ms`,
			...notSelectable,
		},
		'& .icon': {
			flex: '0 0 auto',
			margin: '0.4rem 0.6rem',
			transition: `color ${theme.transitions.duration.standard}ms`,
		}
	},

	'& .feedback': {
		fontSize: '0.75em',
		letterSpacing: '0.03em',
		lineHeight: 1.2,
		padding: '0.3em 1.2em 0',
		transition: `color ${theme.transitions.duration.standard}ms`,
	},
})
const useStyles = makeStyles((theme) => ({
	multipleChoice: style(theme)
}))
export { style }

const useOptionStyle = makeStyles((theme) => ({
	option: {
		background: ({ feedbackType, feedbackColor }) => !feedbackType || feedbackType === 'normal' ? alpha(theme.palette.info.main, 0.1) : alpha(feedbackColor, 0.1),
		color: ({ feedbackColor }) => feedbackColor || 'inherit',
		cursor: ({ readOnly }) => readOnly ? 'auto' : 'pointer',

		'&:hover': {
			background: ({ feedbackType, feedbackColor, readOnly }) => (readOnly ? null : (!feedbackType || feedbackType === 'normal' ? alpha(theme.palette.info.main, 0.2) : alpha(feedbackColor, 0.2))),
		},

		'&.checked, &.withFeedback': {
			background: ({ feedbackType, feedbackColor }) => !feedbackType || feedbackType === 'normal' ? alpha(theme.palette.info.main, 0.2) : alpha(feedbackColor, 0.2),
		},

		'& .checkbox': {
			color: ({ feedbackColor }) => feedbackColor || theme.palette.info.main,
		},
	},
	feedback: {
		color: ({ feedbackColor }) => feedbackColor || 'inherit',
	},
}))

/* This is the MultipleChoice component, used for making multiple-choice questions. It has a variety of properties to be set.
 * - choices (default empty array): the options to display.
 * - id (obligatory): a string indicating what Form id to store the data under. This data always takes the form of an array with the indices of the chosen options. For instance, [0, 3] if the first and fourth option are selected.
 * - validate (default nonEmpty): a validation function. Default is that at least one option should be chosen.
 * - multiple (default false): are multiple choices allowed? If set to true, checkboxes are used instead of radio buttons.
 * - readOnly (default undefined): can the value still be changed? If left undefined, the exercise status is checked and only when the exercise is not done can the value be changed. If this option is defined, it overwrites this.
 * - pick (default undefined): choose a subset of the choices given. If there are six choices and pick is set to four, then only four of the six choices are shown. If left undefined, all choices are included.
 * - include (default []): only used when pick is defined. The given options are then definitely included in the pick. If you set include to [0,3], then choices 0 and 3 are definitely picked, along with a few other random ones. This is useful to make sure you include the correct answer. If only a single option has to be included, no array is needed: this is automatically fixed.
 * - randomOrder (default false): should we show the choices in a random order? Behind the scenes the original order is still used: this only relates to how it is shown to the user.
 * Changing options while the object is already rendered is currently not supported.
 */
export default function MultipleChoice({ id, choices = [], validate = nonEmpty, multiple = false, readOnly, pick, include, randomOrder = false, persistent }) {
	const [input, setInput] = useFormParameter(id, { initialValue: getEmptyData(multiple), subscribe: true, persistent })
	const { feedback, feedbackInput } = useFieldFeedback({ fieldId: id, subFields: numberArray(0, choices.length - 1), validate })
	const { done } = useStatus()
	readOnly = (readOnly === undefined ? done : readOnly)
	const Element = multiple ? Checkbox : Radio
	const classes = useStyles()
	const mappingRef = useRef()

	// Extract input data.
	if (input.value.multiple !== multiple)
		throw new Error(`MultipleChoice error: changing the "multiple" property during operation is not supported.`)
	const { value: { selection } } = input
	const setSelection = (selection) => setInput(input => ({ ...input, value: { ...input.value, selection } }))

	// Set up a function that can give us a mapping.
	const numChoices = choices.length
	const getMapping = useCallback(() => {
		let newMapping
		if (pick === undefined) {
			newMapping = numberArray(0, numChoices - 1) // Show all choices.
		} else {
			const includeArray = (include === undefined ? [] : (Array.isArray(include) ? include : [include])) // Use [] as a default value and ensure it's an array.
			const nonIncluded = numberArray(0, numChoices - 1).filter(index => !includeArray.includes(index)) // List all elements we may still select (those that are not automatically included).
			const numExtra = Math.max(pick - includeArray.length, 0) // How many should we still pick?
			newMapping = [...includeArray, ...getRandomSubset(nonIncluded, numExtra)]
		}
		return randomOrder ? shuffle(newMapping) : newMapping.sort()
	}, [numChoices, pick, include, randomOrder])

	// If the mapping is not appropriate, generate new one.
	if (!mappingRef.current)
		mappingRef.current = getMapping()
	const mapping = mappingRef.current

	// Set up handlers to change selections.
	const isChecked = (index) => selection.includes(index)
	const activateItem = readOnly ? noop : (multiple ?
		((index) => isChecked(index) ? undefined : setSelection([...selection, index])) :
		((index) => isChecked(index) ? undefined : setSelection([index]))
	)
	const deactivateItem = readOnly ? noop : (multiple ?
		((index) => isChecked(index) ? setSelection(selection.filter(item => item !== index)) : undefined) :
		((index) => isChecked(index) ? setSelection([]) : undefined)
	)
	const toggleItem = (index) => (isChecked(index) ? deactivateItem(index) : activateItem(index))

	// Determine if feedback text is shown: only if there is feedback and if the feedbackInput equals the current input.
	const isFeedbackText = feedback !== undefined && !!feedback.text
	const inputEqualToFeedbackInput = feedbackInput && equals(input.value, feedbackInput.value)
	const showFeedbackText = isFeedbackText && inputEqualToFeedbackInput

	// Set up output.
	if (!mapping)
		return null
	return <>
		<ul className={clsx(classes.multipleChoice, readOnly ? 'disabled' : 'enabled')}>
			{mapping ? mapping.map(index => <Choice key={index} checked={isChecked(index)} activate={() => activateItem(index)} deactivate={() => activateItem(index)} toggle={() => toggleItem(index)} Element={Element} feedback={feedback && feedback[index]} readOnly={readOnly}>{choices[index]}</Choice>
			) : null}
		</ul>
		{showFeedbackText ? <FeedbackBlock {...feedback} /> : null}
	</>
}

// A choice is a single item from the list.
function Choice({ checked, activate, deactivate, toggle, Element, feedback, readOnly, children }) {
	const { type: feedbackType, text: feedbackText, Icon, color: feedbackColor } = feedback || {}
	const hasFeedback = (feedbackType && feedbackType !== 'normal')
	const classes = useOptionStyle({ feedbackType, feedbackColor, readOnly })
	const handleChange = (evt, check) => check ? activate() : deactivate()

	return <>
		<Box boxShadow={1} onClick={toggle} className={clsx('option', checked ? 'checked' : 'unchecked', classes.option, hasFeedback ? 'withFeedback' : 'withoutFeedback')}>
			<Element className="checkbox" color="default" checked={checked} onChange={handleChange} disabled={readOnly} />
			<div className="contents">{children}</div>
			{Icon ? <Icon className="icon" /> : null}
		</Box>
		{feedbackText ? <Box className={clsx('feedback', classes.feedback)}>{feedbackText}</Box> : null}
	</>
}

// These are validation functions.
export function nonEmpty(input) {
	if (isEmpty(input.value))
		return 'Je hebt nog niets geselecteerd.'
}

function getEmptyData(multiple) {
	return {
		type: 'MultipleChoice',
		value: getEmpty(multiple),
	}
}