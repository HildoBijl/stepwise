import React, { useRef, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Radio from '@material-ui/core/Radio'
import Checkbox from '@material-ui/core/Checkbox'
import clsx from 'clsx'

import { numberArray, shuffle } from 'step-wise/util/arrays'
import { processOptions, filterOptions, deepEquals } from 'step-wise/util/objects'
import { getRandomSubset } from 'step-wise/util/random'

import { useLatest, useImmutableValue } from 'util/react'
import { notSelectable } from 'ui/theme'
import { FeedbackBlock } from 'ui/components'

import { useAsInput, defaultInputOptions } from '../../../support/Input'

import { getEmptySI } from '../support'
import * as validation from '../validation'

import Option from './Option'

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
	multipleChoice: {
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
	}
}))
export { style }

export const defaultMultipleChoiceOptions = {
	...defaultInputOptions,
	validate: validation.nonEmpty,

	choices: [],
	multiple: false,
	pick: undefined,
	include: [],
	randomOrder: false,
}
export default function MultipleChoice(options) {
	options = processOptions(options, defaultMultipleChoiceOptions)
	let { choices, multiple, pick, include, randomOrder } = options
	multiple = useImmutableValue(multiple) // Ensure that "multiple" does not change.

	// Register as an input field.
	const { readOnly, FI: selection, setFI: setSelection, feedback, feedbackInput } = useAsInput({
		...filterOptions(options, defaultInputOptions),
		useFocusRegistration: false, // Tabbing does not focus MultipleChoice elements.
		initialSI: getEmptySI(multiple),
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
			{mapping ? mapping.map(index => <Option key={index} checked={isChecked(index)} activate={() => activateItem(index)} deactivate={() => activateItem(index)} toggle={() => toggleItem(index)} Element={Element} feedback={feedback?.subfields && feedback.subfields[index]} readOnly={readOnly}>{choices[index]}</Option>
			) : null}
		</ul>
		{showFeedbackText ? <FeedbackBlock {...feedback} /> : null}
	</>
}
MultipleChoice.validation = validation
