import React, { useRef, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Radio from '@material-ui/core/Radio'
import Checkbox from '@material-ui/core/Checkbox'
import { alpha } from '@material-ui/core/styles/colorManipulator'
import Box from '@material-ui/core/Box'
import clsx from 'clsx'

import { numberArray, shuffle } from 'step-wise/util/arrays'
import { processOptions, filterOptions, deepEquals } from 'step-wise/util/objects'
import { getRandomSubset } from 'step-wise/util/random'

import { useLatest, useImmutableValue } from 'util/react'
import { notSelectable } from 'ui/theme'
import { FeedbackBlock } from 'ui/components'

import { useAsInput, defaultInputOptions } from '../support/Input'

import { getEmptySI, functionalize } from './support'
import { nonEmpty } from './validation'

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
 * - id (obligatory): a string indicating what Form id to store the data under. This data is a number (or undefined) when "multiple" is false or an array when "multiple" is true.
 * - validate (default nonEmpty): a validation function. Default is that at least one option should be chosen.
 * - multiple (default false): are multiple choices allowed? If set to true, checkboxes are used instead of radio buttons.
 * - readOnly (default undefined): can the value still be changed? If left undefined, the exercise status is checked and only when the exercise is not done can the value be changed. If this option is defined, it overwrites this.
 * - pick (default undefined): choose a subset of the choices given. If there are six choices and pick is set to four, then only four of the six choices are shown. If left undefined, all choices are included.
 * - include (default []): only used when pick is defined. The given options are then definitely included in the pick. If you set include to [0,3], then choices 0 and 3 are definitely picked, along with a few other random ones. This is useful to make sure you include the correct answer. If only a single option has to be included, no array is needed: this is automatically fixed.
 * - randomOrder (default false): should we show the choices in a random order? Behind the scenes the original order is still used: this only relates to how it is shown to the user.
 * Changing options while the object is already rendered is currently not supported.
 */
export default function MultipleChoice(options) {
	options = processOptions(options, defaultMultipleChoiceOptions)
	let { choices, multiple, pick, include, randomOrder } = options
	multiple = useImmutableValue(multiple) // Ensure that "multiple" does not change.

	// Register as an input field.
	const { readOnly, FI: selection, setFI: setSelection, feedback, feedbackInput } = useAsInput({
		...filterOptions(options, defaultInputOptions),
		useFocusRegistration: false, // Tabbing does not focus MultipleChoice elements.
		initialSI: getEmptySI(multiple),
		subFields: numberArray(0, choices.length - 1),
		functionalize,
	})
	const selectionRef = useLatest(selection)

	// Set up important elements and properties.
	const Element = multiple ? Checkbox : Radio
	const classes = useStyles()
	const mappingRef = useRef()

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
		return randomOrder ? shuffle(newMapping) : newMapping.sort((a, b) => a - b)
	}, [numChoices, pick, include, randomOrder])

	// If the mapping is not appropriate, generate new one.
	if (!mappingRef.current)
		mappingRef.current = getMapping()
	const mapping = mappingRef.current

	// Set up handlers to change selections.
	const isChecked = useCallback((index) => multiple ? selectionRef.current.includes(index) : selectionRef.current === index, [multiple, selectionRef])
	const activateItem = useCallback((index) => !readOnly && (multiple ? setSelection(selection => [...selection, index]) : setSelection(index)), [readOnly, multiple, setSelection])
	const deactivateItem = useCallback((index) => !readOnly && (multiple ? setSelection(selection => selection.filter(item => item !== index)) : setSelection(undefined)), [readOnly, multiple, setSelection])
	const toggleItem = useCallback((index) => isChecked(index) ? deactivateItem(index) : activateItem(index), [isChecked, activateItem, deactivateItem])

	// Determine if feedback text is shown: only if there is feedback and if the feedbackInput equals the current input.
	const isFeedbackText = feedback !== undefined && !!feedback.text
	const inputEqualToFeedbackInput = deepEquals(selection, feedbackInput)
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
export const defaultMultipleChoiceOptions = {
	...defaultInputOptions,
	validate: nonEmpty,

	choices: [],
	multiple: false,
	pick: undefined,
	include: [],
	randomOrder: false,
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
